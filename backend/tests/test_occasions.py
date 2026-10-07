"""Occasion integration checks against an isolated, rolled-back local PostgreSQL schema.

Run from backend with app settings configured:
    python -m unittest discover -s tests -v
No test data is written to the shop's normal schema.
"""
import asyncio
import importlib.util
import json
from pathlib import Path
import unittest
from urllib.parse import urlsplit
from uuid import uuid4

from alembic.migration import MigrationContext
from alembic.operations import Operations
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import Base, engine
from app.deps import get_current_admin, get_db
from app.main import app
from app.models.occasion import Occasion
from app.models.product import Product
from app.schemas.occasion import OccasionInput


async def request(method, url, body=None):
    parsed = urlsplit(url)
    encoded = json.dumps(body).encode() if body is not None else b""
    messages = []
    received = False
    async def receive():
        nonlocal received
        if received:
            return {"type": "http.disconnect"}
        received = True
        return {"type": "http.request", "body": encoded, "more_body": False}
    async def send(message):
        messages.append(message)
    scope = {
        "type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1",
        "method": method, "scheme": "http", "path": parsed.path,
        "raw_path": parsed.path.encode(), "query_string": parsed.query.encode(),
        "headers": [(b"content-type", b"application/json")],
        "server": ("localhost", 80), "client": ("localhost", 12345), "root_path": "",
    }
    await app(scope, receive, send)
    status = next(item["status"] for item in messages if item["type"] == "http.response.start")
    content = b"".join(item.get("body", b"") for item in messages if item["type"] == "http.response.body")
    return status, json.loads(content) if content else None


class OccasionIntegrationTests(unittest.TestCase):
    def setUp(self):
        if engine.url.host not in {"localhost", "127.0.0.1", "::1", None}:
            self.skipTest("Integration checks only run against local PostgreSQL")
        self.connection = engine.connect()
        self.transaction = self.connection.begin()
        self.schema = "occasion_test_" + uuid4().hex
        self.connection.execute(text(f'CREATE SCHEMA "{self.schema}"'))
        self.connection.execute(text(f'SET LOCAL search_path TO "{self.schema}"'))
        # Execute the real migration, rather than recreating its tables by hand.
        Base.metadata.create_all(self.connection, tables=[table for table in Base.metadata.sorted_tables if table.name not in {"occasions", "product_occasions"}])
        path = Path(__file__).resolve().parents[1] / "alembic/versions/b8d4e6f2a901_add_occasions.py"
        spec = importlib.util.spec_from_file_location("occasion_migration", path)
        migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration)
        with Operations.context(MigrationContext.configure(self.connection)):
            migration.upgrade()
        self.db = Session(bind=self.connection, join_transaction_mode="create_savepoint", expire_on_commit=False)
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[get_current_admin] = lambda: object()

    def tearDown(self):
        app.dependency_overrides.clear()
        self.db.close()
        self.transaction.rollback()
        self.connection.close()

    def call(self, method, url, body=None, expected=200):
        status, data = asyncio.run(request(method, url, body))
        self.assertEqual(status, expected, data)
        return data

    def create_product(self, name, ids, active=True):
        return self.call("POST", "/api/admin/products", {
            "name": name, "description": "A bouquet", "price": "45.00",
            "categories": ["flowers"], "image_url": "https://example.com/photo.jpg",
            "occasion_ids": ids, "is_active": active,
        }, expected=201)

    def test_migration_and_admin_auth(self):
        cards = self.call("GET", "/api/occasions")
        self.assertEqual(len(cards), 6)
        self.assertEqual(cards[0]["name"], "Birthday")
        self.assertTrue(all(card["image_url"].startswith("https://lh3.googleusercontent.com/") for card in cards))
        app.dependency_overrides.pop(get_current_admin)
        for method, path, body in [
            ("GET", "/api/admin/occasions", None),
            ("POST", "/api/admin/occasions", {"name": "Unauthorized", "image_url": "https://example.com/a.jpg"}),
            ("PUT", "/api/admin/occasions/1", {"name": "Unauthorized", "image_url": "https://example.com/a.jpg"}),
            ("DELETE", "/api/admin/occasions/1", None),
        ]:
            status, _ = asyncio.run(request(method, path, body))
            self.assertIn(status, (401, 403))

    def test_product_selection_filtering_and_pagination(self):
        first = self.create_product("First", [1, 2, 1])
        second = self.create_product("Second", [1])
        self.create_product("Unassigned", [])
        self.create_product("Hidden product", [1], False)
        self.assertEqual(first["occasion_ids"], [1, 2])
        matches = self.call("GET", "/api/products?occasion=1")
        self.assertEqual([item["id"] for item in matches], [second["id"], first["id"]])
        self.assertEqual(len(self.call("GET", "/api/products?occasion=2")), 1)
        self.assertEqual(len(self.call("GET", "/api/products?occasion=1&limit=1&skip=1")), 1)
        self.assertEqual(self.call("GET", "/api/products?occasion=1&category=plants"), [])
        self.assertEqual(len(self.call("GET", "/api/products?occasion=1&search=First")), 1)
        changed = self.call("PUT", f'/api/admin/products/{first["id"]}', {"occasion_ids": []})
        self.assertEqual(changed["occasion_ids"], [])
        self.assertEqual(len(self.call("GET", "/api/products?occasion=1")), 1)

    def test_rename_hide_delete_and_custom_link(self):
        product = self.create_product("Forever", [1, 2])
        card = self.call("GET", "/api/admin/occasions/1")
        renamed = self.call("PUT", "/api/admin/occasions/1", {**card, "name": "Celebrations", "shop_link": "/shop?category=flowers"})
        self.assertEqual(renamed["shop_link"], "/shop?category=flowers")
        self.assertEqual(len(self.call("GET", "/api/products?occasion=1")), 1)
        self.call("PUT", "/api/admin/occasions/1", {**renamed, "is_active": False})
        self.assertEqual(len(self.call("GET", "/api/occasions")), 5)
        self.assertEqual(len(self.call("GET", "/api/admin/occasions")), 6)
        self.assertEqual(self.call("GET", "/api/products?occasion=1"), [])
        saved = self.call("GET", f'/api/admin/products/{product["id"]}')
        self.assertEqual(saved["occasion_ids"], [1, 2])
        self.call("DELETE", "/api/admin/occasions/1", expected=204)
        self.db.expire_all()
        saved = self.call("GET", f'/api/admin/products/{product["id"]}')
        self.assertEqual(saved["occasion_ids"], [2])
        self.assertEqual(len(self.call("GET", "/api/products")), 1)
        new = self.call("POST", "/api/admin/occasions", {"name": "Graduation", "image_url": "https://example.com/grad.jpg", "shop_link": ""}, expected=201)
        self.assertGreater(new["id"], 6)
        self.assertIsNone(new["shop_link"])

    def test_invalid_ids_and_unsafe_links_are_rejected(self):
        product = self.create_product("Safe", [1])
        self.call("PUT", f'/api/admin/products/{product["id"]}', {"occasion_ids": [99999]}, expected=422)
        self.call("PUT", f'/api/admin/products/{product["id"]}', {"occasion_ids": None}, expected=422)
        for link in ["javascript:alert(1)", "//evil.example/shop", "https://evil.example/shop", "/admin", "/shop#bad", "/shop\\evil"]:
            self.call("POST", "/api/admin/occasions", {"name": "Unsafe", "image_url": "https://example.com/a.jpg", "shop_link": link}, expected=422)
        self.call("POST", "/api/admin/occasions", {"name": "   ", "image_url": "https://example.com/a.jpg"}, expected=422)


if __name__ == "__main__":
    unittest.main()

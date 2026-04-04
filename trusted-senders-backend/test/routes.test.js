// Tests for the trusted-senders-backend routes. Uses Node's built-in test runner
// (node --test) and supertest to drive the Express app with a mocked Supabase.
//
// Run: npm test  (from trusted-senders-backend/)

const { test, describe } = require("node:test")
const assert = require("node:assert/strict")
const request = require("supertest")
const { createApp } = require("../app")
const { createMockSupabase } = require("./mockSupabase")

function makeApp(responses) {
	const supabase = createMockSupabase(responses)
	const app = createApp(supabase)
	return { app, supabase }
}

describe("POST /add-trusted", () => {
	test("400 when user_email missing", async () => {
		const { app } = makeApp({})
		const res = await request(app).post("/add-trusted").send({ trusted_email: "a@b.com" })
		assert.equal(res.status, 400)
		assert.match(res.body.error, /Missing/)
	})

	test("400 when trusted_email missing", async () => {
		const { app } = makeApp({})
		const res = await request(app).post("/add-trusted").send({ user_email: "u@x.com" })
		assert.equal(res.status, 400)
	})

	test("201 + normalizes emails to lowercase/trimmed on success", async () => {
		const { app, supabase } = makeApp({
			trusted_senders: {
				upsert: {
					data: [{ user_email: "u@x.com", trusted_email: "a@b.com", trusted_name: "Alice" }],
					error: null,
				},
			},
		})
		const res = await request(app).post("/add-trusted").send({ user_email: " U@X.com ", trusted_email: "  A@B.com ", trusted_name: "Alice" })
		assert.equal(res.status, 201)
		assert.equal(res.body.data.trusted_email, "a@b.com")

		const upsertCall = supabase.__calls.find((c) => c.op === "upsert")
		assert.equal(upsertCall.payload.user_email, "u@x.com")
		assert.equal(upsertCall.payload.trusted_email, "a@b.com")
		assert.equal(upsertCall.options.onConflict, "user_email,trusted_email")
	})

	test("500 when supabase returns an error", async () => {
		const { app } = makeApp({
			trusted_senders: { upsert: { data: null, error: { message: "db broke" } } },
		})
		const res = await request(app).post("/add-trusted").send({ user_email: "u@x.com", trusted_email: "a@b.com" })
		assert.equal(res.status, 500)
	})
})

describe("POST /remove-trusted", () => {
	test("400 when fields missing", async () => {
		const { app } = makeApp({})
		const res = await request(app).post("/remove-trusted").send({ user_email: "u@x.com" })
		assert.equal(res.status, 400)
	})

	test("200 deletes from both trusted_senders AND email_sender_status", async () => {
		const { app, supabase } = makeApp({})
		const res = await request(app).post("/remove-trusted").send({ user_email: "u@x.com", trusted_email: "a@b.com" })
		assert.equal(res.status, 200)
		const deletes = supabase.__calls.filter((c) => c.op === "delete")
		assert.equal(deletes.length, 2)
		assert.deepEqual(deletes.map((c) => c.table).sort(), ["email_sender_status", "trusted_senders"])
	})

	test("500 when trusted_senders delete fails", async () => {
		const { app } = makeApp({
			trusted_senders: { delete: { data: null, error: { message: "fail" } } },
		})
		const res = await request(app).post("/remove-trusted").send({ user_email: "u@x.com", trusted_email: "a@b.com" })
		assert.equal(res.status, 500)
	})
})

describe("POST /update-email-status", () => {
	const baseBody = {
		user_email: "u@x.com",
		email_id: "mail-123",
		sender_email: "sender@evil.com",
		status: "confirmed",
	}

	test("400 when required fields missing", async () => {
		const { app } = makeApp({})
		const res = await request(app).post("/update-email-status").send({ user_email: "u@x.com" })
		assert.equal(res.status, 400)
	})

	test("400 when status is not in the valid list", async () => {
		const { app } = makeApp({})
		const res = await request(app)
			.post("/update-email-status")
			.send({ ...baseBody, status: "hotdog" })
		assert.equal(res.status, 400)
		assert.match(res.body.error, /Invalid status/)
	})

	// The whole point of the backend: log every possible email interaction. Exercise each.
	for (const status of [
		"confirmed",
		"denied",
		"added_to_trusted",
		"removed_from_trusted",
		"reported_impersonation",
		"reported_spam",
		"trusted_once",
		"email_opened",
	]) {
		test(`200 accepts status=${status} and upserts into email_sender_status`, async () => {
			const { app, supabase } = makeApp({
				email_sender_status: { upsert: { data: [{ ...baseBody, status }], error: null } },
			})
			const res = await request(app)
				.post("/update-email-status")
				.send({ ...baseBody, status })
			assert.equal(res.status, 200)
			const upsert = supabase.__calls.find((c) => c.table === "email_sender_status" && c.op === "upsert")
			assert.ok(upsert, "expected an upsert into email_sender_status")
			assert.equal(upsert.payload.status, status)
			assert.equal(upsert.payload.interaction_type, "interacted")
			assert.equal(upsert.options.onConflict, "user_email,email_id")
		})
	}

	test("reported_phishing also inserts into phishing_reports", async () => {
		const { app, supabase } = makeApp({
			email_sender_status: { upsert: { data: [{ ...baseBody, status: "reported_phishing" }], error: null } },
		})
		const res = await request(app)
			.post("/update-email-status")
			.send({ ...baseBody, status: "reported_phishing" })
		assert.equal(res.status, 200)
		const phishingInsert = supabase.__calls.find((c) => c.table === "phishing_reports" && c.op === "insert")
		assert.ok(phishingInsert, "expected insert into phishing_reports table")
		assert.equal(phishingInsert.payload.report_type, "phishing")
		assert.equal(phishingInsert.payload.mail_id, baseBody.email_id)
		assert.equal(phishingInsert.payload.sender_email, baseBody.sender_email)
	})

	test("non-phishing status does NOT touch phishing_reports", async () => {
		const { app, supabase } = makeApp({
			email_sender_status: { upsert: { data: [{ ...baseBody, status: "added_to_trusted" }], error: null } },
		})
		await request(app)
			.post("/update-email-status")
			.send({ ...baseBody, status: "added_to_trusted" })
		const phishingInsert = supabase.__calls.find((c) => c.table === "phishing_reports")
		assert.equal(phishingInsert, undefined)
	})

	test("auto_detected interaction_type with auth_failure_reason is stored", async () => {
		const { app, supabase } = makeApp({
			email_sender_status: { upsert: { data: [{ ...baseBody }], error: null } },
		})
		const res = await request(app)
			.post("/update-email-status")
			.send({
				...baseBody,
				status: "email_opened",
				interaction_type: "auto_detected",
				auth_failure_reason: "dmarc_fail",
			})
		assert.equal(res.status, 200)
		const upsert = supabase.__calls.find((c) => c.table === "email_sender_status" && c.op === "upsert")
		assert.equal(upsert.payload.interaction_type, "auto_detected")
		assert.equal(upsert.payload.auth_failure_reason, "dmarc_fail")
	})

	test("invalid interaction_type falls back to 'interacted'", async () => {
		const { app, supabase } = makeApp({
			email_sender_status: { upsert: { data: [{ ...baseBody }], error: null } },
		})
		await request(app)
			.post("/update-email-status")
			.send({ ...baseBody, interaction_type: "wiggle" })
		const upsert = supabase.__calls.find((c) => c.table === "email_sender_status" && c.op === "upsert")
		assert.equal(upsert.payload.interaction_type, "interacted")
	})

	test("500 when supabase upsert fails", async () => {
		const { app } = makeApp({
			email_sender_status: { upsert: { data: null, error: { message: "conn refused" } } },
		})
		const res = await request(app).post("/update-email-status").send(baseBody)
		assert.equal(res.status, 500)
	})

	test("phishing_reports insert failure does not break the main response", async () => {
		const { app } = makeApp({
			email_sender_status: { upsert: { data: [{ ...baseBody, status: "reported_phishing" }], error: null } },
			phishing_reports: { insert: { data: null, error: { message: "phishing table down" } } },
		})
		const res = await request(app)
			.post("/update-email-status")
			.send({ ...baseBody, status: "reported_phishing" })
		// Core email_sender_status upsert succeeded → request should still be 200.
		assert.equal(res.status, 200)
	})
})

describe("GET /email-status/:user_email/:email_id", () => {
	test("returns existing status row", async () => {
		const { app } = makeApp({
			email_sender_status: {
				select: { data: [{ sender_email: "a@b.com", status: "confirmed" }], error: null },
			},
		})
		const res = await request(app).get("/email-status/u@x.com/mail-123")
		assert.equal(res.status, 200)
		assert.equal(res.body.status, "confirmed")
	})

	test("returns {status: null} when no row found (PGRST116)", async () => {
		const { app } = makeApp({
			email_sender_status: { select: { data: [], error: null } },
		})
		const res = await request(app).get("/email-status/u@x.com/mail-123")
		assert.equal(res.status, 200)
		assert.equal(res.body.status, null)
	})
})

describe("GET /trusted-senders/:user_email", () => {
	test("returns mapped list with name/address", async () => {
		const { app } = makeApp({
			trusted_senders: {
				select: {
					data: [
						{ trusted_email: "alice@x.com", trusted_name: "Alice" },
						{ trusted_email: "bob@y.com", trusted_name: "" },
					],
					error: null,
				},
			},
		})
		const res = await request(app).get("/trusted-senders/u@x.com")
		assert.equal(res.status, 200)
		assert.equal(res.body.trusted_senders.length, 2)
		assert.deepEqual(res.body.trusted_senders[0], { name: "Alice", address: "alice@x.com" })
		assert.deepEqual(res.body.trusted_senders[1], { name: "", address: "bob@y.com" })
	})
})

describe("POST /validate-sender-email", () => {
	test("400 when any field missing", async () => {
		const { app } = makeApp({})
		const res = await request(app).post("/validate-sender-email").send({ user_email: "u@x.com" })
		assert.equal(res.status, 400)
	})

	test("valid=true when sender_email matches a known entry (case-insensitive)", async () => {
		const { app } = makeApp({
			trusted_senders: { select: { data: [{ trusted_email: "alice@x.com" }], error: null } },
		})
		const res = await request(app).post("/validate-sender-email").send({ user_email: "u@x.com", sender_name: "Alice", sender_email: "ALICE@X.COM" })
		assert.equal(res.status, 200)
		assert.equal(res.body.valid, true)
	})

	test("valid=false when sender_email does not match", async () => {
		const { app } = makeApp({
			trusted_senders: { select: { data: [{ trusted_email: "alice@x.com" }], error: null } },
		})
		const res = await request(app).post("/validate-sender-email").send({ user_email: "u@x.com", sender_name: "Alice", sender_email: "mallory@evil.com" })
		assert.equal(res.status, 200)
		assert.equal(res.body.valid, false)
		assert.deepEqual(res.body.known_emails, ["alice@x.com"])
	})
})

describe("DELETE /reset-single-email-status", () => {
	test("400 when missing fields", async () => {
		const { app } = makeApp({})
		const res = await request(app).delete("/reset-single-email-status").send({ user_email: "u@x.com" })
		assert.equal(res.status, 400)
	})

	test("200 deletes the row", async () => {
		const { app, supabase } = makeApp({})
		const res = await request(app).delete("/reset-single-email-status").send({ user_email: "u@x.com", email_id: "mail-123" })
		assert.equal(res.status, 200)
		const del = supabase.__calls.find((c) => c.table === "email_sender_status" && c.op === "delete")
		assert.ok(del)
	})
})

describe("GET /assignment-by-sender/:username/:sender_email", () => {
	test("404 when no matching task", async () => {
		const { app } = makeApp({
			tasks: { select: { data: [], error: null } },
		})
		const res = await request(app).get("/assignment-by-sender/alice/evil%40phish.com")
		assert.equal(res.status, 404)
		assert.equal(res.body.assignment, null)
	})

	test("404 when task exists but no assignment for user", async () => {
		const { app } = makeApp({
			tasks: { select: { data: [{ task_id: 7, task_name: "t", is_phishing: true, phishing_type: "spoof" }], error: null } },
			assignments: { select: { data: [], error: null } },
		})
		const res = await request(app).get("/assignment-by-sender/alice/a%40b.com")
		assert.equal(res.status, 404)
	})

	test("200 returns merged task + assignment fields", async () => {
		const { app } = makeApp({
			tasks: {
				select: {
					data: [{ task_id: 7, task_name: "Phish-Alpha", is_phishing: true, phishing_type: "spoof" }],
					error: null,
				},
			},
			assignments: {
				select: {
					data: [
						{
							assignment_id: 42,
							sent_at: "2026-04-01T00:00:00Z",
							completed_at: null,
							stage: 1,
							completion_type: null,
						},
					],
					error: null,
				},
			},
		})
		const res = await request(app).get("/assignment-by-sender/alice/a%40b.com")
		assert.equal(res.status, 200)
		assert.equal(res.body.assignment_id, 42)
		assert.equal(res.body.task_id, 7)
		assert.equal(res.body.task_name, "Phish-Alpha")
		assert.equal(res.body.is_phishing, true)
	})
})

describe("GET /  (health check)", () => {
	test("200", async () => {
		const { app } = makeApp({})
		const res = await request(app).get("/")
		assert.equal(res.status, 200)
		assert.match(res.text, /Running/)
	})
})

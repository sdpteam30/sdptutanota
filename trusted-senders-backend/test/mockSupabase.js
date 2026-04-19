// mockSupabase.js — tiny fake of the Supabase client surface used by app.js.
// Each test configures what each table operation should return. Every call is
// recorded on `calls` so tests can assert arguments were forwarded correctly.

function createMockSupabase(tableResponses = {}) {
	const calls = []

	function builder(tableName, op, payload, options) {
		calls.push({ table: tableName, op, payload, options, filters: [], modifiers: [] })
		const call = calls[calls.length - 1]

		// The queued response for this table+operation, or a default success response.
		const response = (tableResponses[tableName] && tableResponses[tableName][op]) ?? {
			data: [],
			error: null,
			count: 0,
		}

		const chain = {
			eq(col, val) {
				call.filters.push({ type: "eq", col, val })
				return chain
			},
			is(col, val) {
				call.filters.push({ type: "is", col, val })
				return chain
			},
			order(col, opts) {
				call.modifiers.push({ type: "order", col, opts })
				return chain
			},
			limit(n) {
				call.modifiers.push({ type: "limit", n })
				return chain
			},
			select(cols) {
				call.modifiers.push({ type: "select", cols })
				return chain
			},
			single() {
				call.modifiers.push({ type: "single" })
				// .single() unwraps to a single object (or returns PGRST116 when empty)
				if (response.data && Array.isArray(response.data)) {
					if (response.data.length === 0) {
						return Promise.resolve({ data: null, error: { code: "PGRST116", message: "no rows" } })
					}
					return Promise.resolve({ data: response.data[0], error: response.error })
				}
				return Promise.resolve(response)
			},
			// Make the chain awaitable — resolves to { data, error } (or { data, error, count })
			then(onFulfilled, onRejected) {
				return Promise.resolve(response).then(onFulfilled, onRejected)
			},
		}
		return chain
	}

	const client = {
		from(tableName) {
			return {
				upsert(payload, options) {
					return builder(tableName, "upsert", payload, options)
				},
				insert(payload) {
					return builder(tableName, "insert", payload)
				},
				update(payload) {
					return builder(tableName, "update", payload)
				},
				delete() {
					return builder(tableName, "delete")
				},
				select(cols) {
					return builder(tableName, "select", cols)
				},
			}
		},
		__calls: calls,
	}
	return client
}

module.exports = { createMockSupabase }

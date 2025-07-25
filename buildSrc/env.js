/** @param {{staticUrl: string | null, version: string, mode: EnvMode | null, dist: boolean, domainConfigs: DomainConfigMap, networkDebugging:boolean, clientName: string}} params
 *  @return {env}
 */
export function create(params) {
	const { staticUrl, version, mode, dist, domainConfigs, networkDebugging = false, clientName } = params

	// More detailed error reporting
	const missing = []
	if (version == null) missing.push(`version (${version})`)
	if (mode == null) missing.push(`mode (${mode})`)
	if (dist == null) missing.push(`dist (${dist})`)
	// Skip networkDebugging check since we have a default value

	if (missing.length > 0) {
		throw new Error(`[CUSTOM] Invalid env parameters. Missing: ${missing.join(", ")}. Got: ${JSON.stringify(params)}`)
	}
	return {
		staticUrl: staticUrl?.toString(),
		versionNumber: version,
		dist,
		mode: mode ?? "Browser",
		timeout: 20000,
		domainConfigs,
		platformId: null,
		networkDebugging,
		clientName,
	}
}

/** @param {env} env */
export function preludeEnvPlugin(env) {
	return {
		name: "prelude-env",
		banner() {
			return `globalThis.env = ${JSON.stringify(env, null, 2)};`
		},
	}
}

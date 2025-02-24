import { resolveTypeReference } from "../../common/EntityFunctions";
import { isSameTypeRef } from "@tutao/tutanota-utils";
import { assertWorkerOrNode } from "../../common/Env";
import { ProgrammingError } from "../../common/error/ProgrammingError";
import { LoginIncompleteError } from "../../common/error/LoginIncompleteError.js";
assertWorkerOrNode();
export class ServiceExecutor {
    restClient;
    authDataProvider;
    instanceMapper;
    cryptoFacade;
    constructor(restClient, authDataProvider, instanceMapper, cryptoFacade) {
        this.restClient = restClient;
        this.authDataProvider = authDataProvider;
        this.instanceMapper = instanceMapper;
        this.cryptoFacade = cryptoFacade;
    }
    get(service, data, params) {
        return this.executeServiceRequest(service, "GET" /* HttpMethod.GET */, data, params);
    }
    post(service, data, params) {
        return this.executeServiceRequest(service, "POST" /* HttpMethod.POST */, data, params);
    }
    put(service, data, params) {
        return this.executeServiceRequest(service, "PUT" /* HttpMethod.PUT */, data, params);
    }
    delete(service, data, params) {
        return this.executeServiceRequest(service, "DELETE" /* HttpMethod.DELETE */, data, params);
    }
    async executeServiceRequest(service, method, requestEntity, params) {
        const methodDefinition = this.getMethodDefinition(service, method);
        if (methodDefinition.return &&
            params?.sessionKey == null &&
            (await resolveTypeReference(methodDefinition.return)).encrypted &&
            !this.authDataProvider.isFullyLoggedIn()) {
            // Short-circuit before we do an actual request which we can't decrypt
            // If we have a session key passed it doesn't mean that it is for the return type but it is likely
            // so we allow the request.
            throw new LoginIncompleteError(`Tried to make service request with encrypted return type but is not fully logged in yet, service: ${service.name}`);
        }
        const modelVersion = await this.getModelVersion(methodDefinition);
        const path = `/rest/${service.app.toLowerCase()}/${service.name.toLowerCase()}`;
        const headers = { ...this.authDataProvider.createAuthHeaders(), ...params?.extraHeaders, v: modelVersion };
        const encryptedEntity = await this.encryptDataIfNeeded(methodDefinition, requestEntity, service, method, params ?? null);
        const data = await this.restClient.request(path, method, {
            queryParams: params?.queryParams,
            headers,
            responseType: "application/json" /* MediaType.Json */,
            body: encryptedEntity ?? undefined,
            suspensionBehavior: params?.suspensionBehavior,
            baseUrl: params?.baseUrl,
        });
        if (methodDefinition.return) {
            return await this.decryptResponse(methodDefinition.return, data, params);
        }
    }
    getMethodDefinition(service, method) {
        switch (method) {
            case "GET" /* HttpMethod.GET */:
                return service["get"];
            case "POST" /* HttpMethod.POST */:
                return service["post"];
            case "PUT" /* HttpMethod.PUT */:
                return service["put"];
            case "DELETE" /* HttpMethod.DELETE */:
                return service["delete"];
        }
    }
    async getModelVersion(methodDefinition) {
        // This is some kind of a hack because we don't generate data for the whole model anywhere (unfortunately).
        const someTypeRef = methodDefinition.data ?? methodDefinition.return;
        if (someTypeRef == null) {
            throw new ProgrammingError("Need either data or return for the service method!");
        }
        const model = await resolveTypeReference(someTypeRef);
        return model.version;
    }
    async encryptDataIfNeeded(methodDefinition, requestEntity, service, method, params) {
        if (methodDefinition.data != null) {
            if (requestEntity == null || !isSameTypeRef(methodDefinition.data, requestEntity._type)) {
                throw new ProgrammingError(`Invalid service data! ${service.name} ${method}`);
            }
            const requestTypeModel = await resolveTypeReference(methodDefinition.data);
            if (requestTypeModel.encrypted && params?.sessionKey == null) {
                throw new ProgrammingError("Must provide a session key for an encrypted data transfer type!: " + service);
            }
            const encryptedEntity = await this.instanceMapper.encryptAndMapToLiteral(requestTypeModel, requestEntity, params?.sessionKey ?? null);
            return JSON.stringify(encryptedEntity);
        }
        else {
            return null;
        }
    }
    async decryptResponse(typeRef, data, params) {
        const responseTypeModel = await resolveTypeReference(typeRef);
        // Filter out __proto__ to avoid prototype pollution.
        const instance = JSON.parse(data, (k, v) => (k === "__proto__" ? undefined : v));
        const resolvedSessionKey = await this.cryptoFacade().resolveServiceSessionKey(instance);
        return this.instanceMapper.decryptAndMapToInstance(responseTypeModel, instance, resolvedSessionKey ?? params?.sessionKey ?? null);
    }
}
//# sourceMappingURL=ServiceExecutor.js.map
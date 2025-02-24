import { create } from "../../common/utils/EntityUtils.js";
import { TypeRef } from "@tutao/tutanota-utils";
import { typeModels } from "./TypeModels.js";
export const BlobAccessTokenPostInTypeRef = new TypeRef("storage", "BlobAccessTokenPostIn");
export function createBlobAccessTokenPostIn(values) {
    return Object.assign(create(typeModels.BlobAccessTokenPostIn, BlobAccessTokenPostInTypeRef), values);
}
export const BlobAccessTokenPostOutTypeRef = new TypeRef("storage", "BlobAccessTokenPostOut");
export function createBlobAccessTokenPostOut(values) {
    return Object.assign(create(typeModels.BlobAccessTokenPostOut, BlobAccessTokenPostOutTypeRef), values);
}
export const BlobArchiveRefTypeRef = new TypeRef("storage", "BlobArchiveRef");
export function createBlobArchiveRef(values) {
    return Object.assign(create(typeModels.BlobArchiveRef, BlobArchiveRefTypeRef), values);
}
export const BlobGetInTypeRef = new TypeRef("storage", "BlobGetIn");
export function createBlobGetIn(values) {
    return Object.assign(create(typeModels.BlobGetIn, BlobGetInTypeRef), values);
}
export const BlobIdTypeRef = new TypeRef("storage", "BlobId");
export function createBlobId(values) {
    return Object.assign(create(typeModels.BlobId, BlobIdTypeRef), values);
}
export const BlobPostOutTypeRef = new TypeRef("storage", "BlobPostOut");
export function createBlobPostOut(values) {
    return Object.assign(create(typeModels.BlobPostOut, BlobPostOutTypeRef), values);
}
export const BlobReadDataTypeRef = new TypeRef("storage", "BlobReadData");
export function createBlobReadData(values) {
    return Object.assign(create(typeModels.BlobReadData, BlobReadDataTypeRef), values);
}
export const BlobReferenceDeleteInTypeRef = new TypeRef("storage", "BlobReferenceDeleteIn");
export function createBlobReferenceDeleteIn(values) {
    return Object.assign(create(typeModels.BlobReferenceDeleteIn, BlobReferenceDeleteInTypeRef), values);
}
export const BlobReferencePutInTypeRef = new TypeRef("storage", "BlobReferencePutIn");
export function createBlobReferencePutIn(values) {
    return Object.assign(create(typeModels.BlobReferencePutIn, BlobReferencePutInTypeRef), values);
}
export const BlobServerAccessInfoTypeRef = new TypeRef("storage", "BlobServerAccessInfo");
export function createBlobServerAccessInfo(values) {
    return Object.assign(create(typeModels.BlobServerAccessInfo, BlobServerAccessInfoTypeRef), values);
}
export const BlobServerUrlTypeRef = new TypeRef("storage", "BlobServerUrl");
export function createBlobServerUrl(values) {
    return Object.assign(create(typeModels.BlobServerUrl, BlobServerUrlTypeRef), values);
}
export const BlobWriteDataTypeRef = new TypeRef("storage", "BlobWriteData");
export function createBlobWriteData(values) {
    return Object.assign(create(typeModels.BlobWriteData, BlobWriteDataTypeRef), values);
}
export const InstanceIdTypeRef = new TypeRef("storage", "InstanceId");
export function createInstanceId(values) {
    return Object.assign(create(typeModels.InstanceId, InstanceIdTypeRef), values);
}
//# sourceMappingURL=TypeRefs.js.map
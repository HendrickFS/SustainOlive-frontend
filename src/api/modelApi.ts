import api from "./axios";
import {
  createSourceConnectionPayload,
  createTargetConnectionPayload,
} from "../utils/dittoConnectionUtils";

export interface Model {
  thingId: string;
  policyId: string;
  features: any;
}

const AUTH = {
  username: "ditto",
  password: "ditto",
};
const DEV_AUTH = {
  username: "devops",
  password: "foobar",
};

const DEV_AUTH_TOKEN = btoa(`${DEV_AUTH.username}:${DEV_AUTH.password}`);

export const getModel = async (thingId: string) => {
  const response = await api.get(`/api/2/things/${thingId}`, {
    auth: AUTH,
  });
  return response.data;
};

export const getModels = async () => {
  const response = await api.get("/api/2/things", {
    auth: AUTH,
  });
  return response.data;
};

export const postModel = async (model: Model) => {
  const response = await api.put(`/api/2/things/${model.thingId}`, model, {
    auth: AUTH,
  });
  const features = Object.keys(model.features);
  const sourceConnection = createSourceConnectionPayload(
    model.thingId,
    features
  );
  const targetConnection = createTargetConnectionPayload(
    model.thingId,
    features
  );
  await api.post("/devops/piggyback/connectivity/", sourceConnection, {
    auth: DEV_AUTH,
  });
  await api.post("/devops/piggyback/connectivity", targetConnection, {
    auth: DEV_AUTH,
  });
  return response.data;
};

export const updateModel = async (model: Model) => {
  const response = await api.put(`/api/2/things/${model.thingId}`, model, {
    auth: AUTH,
  });
  const features = Object.keys(model.features);
  const sourceConnection = createSourceConnectionPayload(
    model.thingId,
    features
  );
  sourceConnection.piggybackCommand.type =
    "connectivity.commands:modifyConnection";
  const targetConnection = createTargetConnectionPayload(
    model.thingId,
    features
  );
  targetConnection.piggybackCommand.type =
    "connectivity.commands:modifyConnection";
  await api.post("/devops/piggyback/connectivity/", sourceConnection, {
    auth: DEV_AUTH,
  });
  await api.post("/devops/piggyback/connectivity", targetConnection, {
    auth: DEV_AUTH,
  });
  return response.data;
};

export const deleteModel = async (thingId: string) => {
  const response = await api.delete(`/api/2/things/${thingId}`, {
    auth: AUTH,
  });
  return response.data;
};

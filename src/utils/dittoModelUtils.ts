import { getModels } from "../api/modelApi";
import { getType } from "./formatting";
import type { Model } from "../api/modelApi";

export const defaultPolicyId = "olive.default:policy";
export const FeaturesTypes = ["Number"];
// export const FeaturesTypes = ["Boolean", "Number", "String", "Date", "Array"];

const DefaultFeatureValues: Record<string, any> = {
  Boolean: false,
  Number: 0,
  String: "",
  Date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
  Array: [],
};

interface Properties {
  name: string;
  value: any;
  minValue?: number | null;
  maxValue?: number | null;
  unit?: string | null;
  timestamp: string;
}

interface Feature {
  properties: Properties;
}

function newThingID(lastThingId: string): string {
  const prefix = lastThingId.replace(/\d+$/, "");
  const numStr = lastThingId.match(/\d+$/)?.[0] ?? "0";
  const nextNum = (parseInt(numStr, 10) + 1)
    .toString()
    .padStart(numStr.length, "0");
  const nextId = prefix + nextNum;
  return nextId;
}

export async function createSimilarModel(type: string) {
  const models: Model[] = await getModels();
  const similarModels = Array.isArray(models)
    ? models.filter((model) => getType(model.thingId) === type)
    : [];

  similarModels.sort((a, b) => {
    const idA = a.thingId.split(":")[1];
    const idB = b.thingId.split(":")[1];
    return idA.localeCompare(idB);
  });

  const thingId = newThingID(similarModels[similarModels.length - 1].thingId);

  const newModel: Model = {
    thingId,
    policyId: defaultPolicyId,
    features: Object.fromEntries(
      Object.entries(
        similarModels[similarModels.length - 1].features as Record<
          string,
          Feature
        >
      ).map(([name, value]) => [
        name,
        {
          properties: {
            value:
              DefaultFeatureValues[typeof value.properties.value] !== undefined
                ? DefaultFeatureValues[typeof value.properties.value]
                : null,
            timestamp: value.properties.timestamp,
            ...(value.properties.minValue !== undefined && {
              minValue: value.properties.minValue,
            }),
            ...(value.properties.maxValue !== undefined && {
              maxValue: value.properties.maxValue,
            }),
            ...(value.properties.unit !== undefined && {
              unit: value.properties.unit,
            }),
          },
        },
      ])
    ),
  };
  return newModel;
}

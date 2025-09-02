export function createSourceConnectionPayload(
  thingId: string,
  features: string[]
) {
  const [namespace, id] = thingId.split(":");
  const type = namespace.split(".")[1];

  const featureMappings = features
    .map((f) => {
      return `{key:'${f}',name:'${f}'}`;
    })
    .join(",");

  const incomingScript = `function mapToDittoProtocolMsg(headers,textPayload,bytePayload,contentType){ const jsonString=String.fromCharCode.apply(null,new Uint8Array(bytePayload)); const jsonData=JSON.parse(jsonString); const thingId=(jsonData.thingId??'${thingId}').split(':'); const features=[${featureMappings}]; const messages=features.filter(f=>f.key in jsonData).map(f=>Ditto.buildDittoProtocolMsg(thingId[0],thingId[1],'things','twin','commands','modify', \`/features/\${f.name}/properties/value\`,headers,{properties:{value:jsonData[f.key]}})); return messages.length===1?messages[0]:messages; }`;

  return {
    targetActorSelection: "/system/sharding/connection",
    headers: {
      aggregate: false,
      "is-group-topic": false,
      "ditto-sudo": true,
    },
    piggybackCommand: {
      type: "connectivity.commands:createConnection",
      connection: {
        id: `mqtt-${type}-source`,
        connectionType: "mqtt",
        connectionStatus: "open",
        failoverEnabled: true,
        uri: "tcp://mosquitto:1884",
        sources: [
          {
            addresses: [`${namespace}/incoming/#`],
            authorizationContext: ["nginx:ditto"],
            qos: 0,
            filters: [],
          },
        ],
        mappingContext: {
          mappingEngine: "JavaScript",
          options: {
            incomingScript: incomingScript.trim(),
            outgoingScript: `function mapFromDittoProtocolMsg(namespace, id, group, channel, criterion, action, path, dittoHeaders, value, status, extra) {return null;}`,
            loadBytebufferJS: "false",
            loadLongJS: "false",
          },
        },
      },
    },
  };
}

export function createTargetConnectionPayload(
  thingId: string,
  features: string[]
) {
  const [namespace, id] = thingId.split(":");
  const type = namespace.split(".")[1];

  // Cria o trecho: '"temperature": ' + value.temperature.properties.value
  const featurePairs = features
    .map((f) => `"${f}":value.${f}.properties.value`)
    .join(", ");

  const outgoingScript = `function mapFromDittoProtocolMsg(namespace,id,group,channel,criterion,action,path,dittoHeaders,value,status,extra){ let textPayload=JSON.stringify(Object.assign({thingId:namespace+":"+id}, {${featurePairs}})); let bytePayload=null; let contentType="text/plain; charset=UTF-8"; return Ditto.buildExternalMsg(dittoHeaders,textPayload,bytePayload,contentType); }`;

  return {
    targetActorSelection: "/system/sharding/connection",
    headers: {
      aggregate: false,
      "is-group-topic": false,
      "ditto-sudo": true,
    },
    piggybackCommand: {
      type: "connectivity.commands:createConnection",
      connection: {
        id: `mqtt-${type}-target`,
        connectionType: "mqtt",
        connectionStatus: "open",
        failoverEnabled: true,
        uri: "tcp://mosquitto:9002",
        targets: [
          {
            address: `${namespace}.notifications/{{ thing:id }}`,
            topics: ["_/_/things/twin/events", "_/_/things/live/messages"],
            authorizationContext: ["ditto:observer"],
            qos: 0,
          },
        ],
        mappingContext: {
          mappingEngine: "JavaScript",
          options: {
            incomingScript: `function mapToDittoProtocolMsg(headers, textPayload, bytePayload, contentType) {return null;}`,
            outgoingScript: outgoingScript.trim(),
            loadBytebufferJS: "false",
            loadLongJS: "false",
          },
        },
      },
    },
  };
}

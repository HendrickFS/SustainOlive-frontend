import { getType } from "./formatting";

export function createSourceConnectionPayload(
  thingId: string,
  features: string[],
  username: string = "sustainolive",
  password: string = "sustainolive"
) {
  const [namespace, id] = thingId.split(":");
  const type = getType(thingId);

  const featureMappings = features
    .map((f) => {
      const lowercase = f.toLowerCase();
      return `{key:'${lowercase}',name:'${lowercase}'}`;
    })
    .join(",");

  const incomingScript = `function mapToDittoProtocolMsg(headers,textPayload,bytePayload,contentType){try{var jsonData=null; if(bytePayload && bytePayload.length){try{var jsonString=String.fromCharCode.apply(null,new Uint8Array(bytePayload));jsonData=JSON.parse(jsonString);}catch(e){} } if(!jsonData && textPayload){try{jsonData=JSON.parse(textPayload);}catch(e){} } if(!jsonData){console.log('Mapper: payload is not JSON - textPayload=',textPayload); return null;} var thingId=(jsonData.thingId||'').split(':'); if(thingId.length<2){console.log('Mapper: missing or invalid thingId',jsonData.thingId); return null;} var ns=thingId[0], id=thingId[1]; var features=[${featureMappings}]; var now=new Date().toISOString(); var messages=[]; for(var i=0;i<features.length;i++){var f=features[i]; if(Object.prototype.hasOwnProperty.call(jsonData,f.key)){var featureValue=jsonData[f.key]; messages.push(Ditto.buildDittoProtocolMsg(ns,id,'things','twin','commands','modify','/features/'+f.name+'/properties/value',headers,featureValue)); messages.push(Ditto.buildDittoProtocolMsg(ns,id,'things','twin','commands','modify','/features/'+f.name+'/properties/timestamp',headers,now));}} if(messages.length===0){return null;} return messages;}catch(ex){console.log('Mapper exception:',ex);return null;}}`;

  return {
    targetActorSelection: "/system/sharding/connection",
    headers: {
      aggregate: false,
    },
    piggybackCommand: {
      type: "connectivity.commands:createConnection",
      connection: {
        id: `mqtt-${type}-source`,
        connectionType: "mqtt",
        connectionStatus: "open",
        failoverEnabled: true,
        uri: `tcp://${username}:${password}@mosquitto:1884`,
        credentials: {
          type: "plain",
          username: username,
          password: password,
        },
        sources: [
          {
            addresses: [`${type}/incoming/#`],
            authorizationContext: ["nginx:ditto"],
            qos: 0,
            filters: [],
          },
        ],
        mappingContext: {
          mappingEngine: "JavaScript",
          options: {
            incomingScript: incomingScript.trim(),
            outgoingScript: `function mapFromDittoProtocolMsg(namespace,id,group,channel,criterion,action,path,dittoHeaders,value,status,extra){return null;}`,
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
  features: string[],
  username: string = "sustainolive",
  password: string = "sustainolive"
) {
  const [namespace, id] = thingId.split(":");
  const type = getType(thingId);

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
        uri: `tcp://${username}:${password}@mosquitto:9002`,
        targets: [
          {
            address: `${type}.notifications/{{ thing:id }}`,
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

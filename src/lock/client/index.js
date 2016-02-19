import { List, Map, Set } from 'immutable';
// TODOL this module should depend from social stuff
import { STRATEGIES as SOCIAL_STRATEGIES } from '../../social/index';

export function connection(m, strategyName, name) {
  // TODO: this function should take a client, not a map with a client
  // key.
  const connections = strategy(m, strategyName).get("connections", List());
  return connections.find(withName(name)) || Map();
}

function strategy(m, name) {
  // TODO: this function should take a client, not a map with a client
  // key.
  return m.getIn(["client", "strategies"], List()).find(withName(name))
    || Map();
}

function withName(name) {
  return x => x.get("name") === name;
}

function strategyNameToConnectionType(str) {
  if (str === "auth0") {
    return "database";
  } else if (str === "email" || str === "sms") {
    return "passwordless";
  } else if (SOCIAL_STRATEGIES[str]) {
    return "social";
  } else {
    return "unknown";
  }
}

export function pickConnections(m, strs) {
  // NOTE: relevant m schema
  //
  // strategies: [
  //  {name: "strategy", connections: [{name: "connection"}]}
  // ]

  const pickedConnectionsNames = new Set(strs);

  return m.get("strategies", List()).flatMap(s => {
    return s.get("connections")
      .filter(c => pickedConnectionsNames.has(c.get("name")))
      .map(c => {
        return c.set("strategy", s.get("name"))
          .set("type", strategyNameToConnectionType(s.get("name")));
      });
  }).groupBy(c => c.get("type"));
}
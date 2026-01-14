import { useEffect, useState } from "react";
import { getModel, type Model } from "../api/modelApi";
import { getHistoricalData } from "../api/historicalApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { formatFeatureName, formatName } from "../utils/formatting";

interface HistoricalEntry {
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", width: "100%" }}>
        {featureEntries.map(([feature, entries], index) => {
          const isLastOdd = index === featureEntries.length - 1 && featureEntries.length % 2 === 1;
          return (
            <div
              key={feature}
              style={{
                backgroundColor: "#f9f9f9",
                border: "1px solid #eee",
                borderRadius: "4px",
                padding: "12px",
                flex: isLastOdd ? "0 0 100%" : "0 0 calc(50% - 12px)",
              }}
            >
              <h3>{formatFeatureName(feature)}</h3>
              <div style={{ height: "16px" }}></div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={entries}>
                  <XAxis
                    dataKey="time"
                    tickFormatter={(time) => {
                      const date = new Date(time);
                      return date.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }}
                    interval={10}
                    tick={false}
                  />
                  <YAxis
                    domain={(() => {
                      const dataValues = entries.map((entry) => entry.value);
                      const actualDataMin = Math.min(...dataValues);
                      const actualDataMax = Math.max(...dataValues);
                      const dataRange = actualDataMax - actualDataMin;

                      const minThreshold = model?.features[feature]?.properties.minValue;
                      const maxThreshold = model?.features[feature]?.properties.maxValue;

                      const basePadding = Math.max(dataRange * 0.1, Math.abs(actualDataMax - actualDataMin) * 0.1);
                      const padding = dataRange < 0.01 ? 0.1 : basePadding;

                      let domainMin = actualDataMin - padding;
                      let domainMax = actualDataMax + padding;

                      if (minThreshold !== undefined) {
                        const bufferBelowMin = Math.abs(minThreshold) * 0.05;
                        if (actualDataMin <= minThreshold + dataRange * 0.2) {
                          domainMin = Math.min(domainMin, minThreshold - bufferBelowMin);
                        }
                      }

                      if (maxThreshold !== undefined) {
                        const bufferAboveMax = Math.abs(maxThreshold) * 0.05;
                        if (actualDataMax >= maxThreshold - dataRange * 0.2) {
                          domainMax = Math.max(domainMax, maxThreshold + bufferAboveMax);
                        }
                      }

                      return [domainMin, domainMax];
                    })()}
                    tickFormatter={(value) => {
                      if (Math.abs(value) >= 1000) {
                        return Math.round(value).toString();
                      } else if (Math.abs(value) >= 100) {
                        return (Math.round(value * 10) / 10).toString();
                      } else if (Math.abs(value) >= 10) {
                        return (Math.round(value * 100) / 100).toString();
                      } else if (Math.abs(value) >= 1) {
                        return (Math.round(value * 1000) / 1000).toString();
                      } else {
                        return parseFloat((value as number).toFixed(4)).toString();
                      }
                    }}
                    label={{
                      value: model?.features[feature]?.properties.unit || "",
                      position: "top",
                      offset: 0,
                      angle: 0,
                      style: { textAnchor: "middle" },
                      dy: 10,
                      dx: -10,
                    }}
                  />
                  {(() => {
                    const minThreshold = model?.features[feature]?.properties.minValue;
                    const maxThreshold = model?.features[feature]?.properties.maxValue;
                    if (minThreshold === undefined || maxThreshold === undefined) return null;

                    const dataValues = entries.map((entry) => entry.value);
                    const actualDataMin = Math.min(...dataValues);
                    const actualDataMax = Math.max(...dataValues);
                    const dataRange = actualDataMax - actualDataMin;
                    const basePadding = Math.max(dataRange * 0.1, Math.abs(actualDataMax - actualDataMin) * 0.1);
                    const padding = dataRange < 0.01 ? 0.1 : basePadding;

                    let domainMin = actualDataMin - padding;
                    let domainMax = actualDataMax + padding;

                    const dataAlwaysBelowMin = actualDataMax < minThreshold;
                    const dataAlwaysAboveMax = actualDataMin > maxThreshold;

                    if (dataAlwaysBelowMin) {
                      domainMax = Math.max(domainMax, minThreshold + Math.abs(minThreshold - actualDataMax) * 0.1);
                    } else if (dataAlwaysAboveMax) {
                      domainMin = Math.min(domainMin, maxThreshold - Math.abs(actualDataMin - maxThreshold) * 0.1);
                    } else {
                      if (actualDataMin <= minThreshold + dataRange * 0.2) {
                        domainMin = Math.min(domainMin, minThreshold - Math.abs(minThreshold) * 0.05);
                      }
                      if (actualDataMax >= maxThreshold - dataRange * 0.2) {
                        domainMax = Math.max(domainMax, maxThreshold + Math.abs(maxThreshold) * 0.05);
                      }
                    }

                    const areas: JSX.Element[] = [];
                    if (dataAlwaysBelowMin) {
                      areas.push(
                        <ReferenceArea key="critical-low" y1={domainMin} y2={domainMax} fill="red" fillOpacity={0.1} />
                      );
                      if (domainMax > minThreshold) {
                        areas.push(
                          <ReferenceArea key="safe-indicator" y1={minThreshold} y2={domainMax} fill="green" fillOpacity={0.1} />
                        );
                      }
                    } else if (dataAlwaysAboveMax) {
                      areas.push(
                        <ReferenceArea key="critical-high" y1={domainMin} y2={domainMax} fill="red" fillOpacity={0.1} />
                      );
                      if (domainMin < maxThreshold) {
                        areas.push(
                          <ReferenceArea key="safe-indicator" y1={domainMin} y2={maxThreshold} fill="green" fillOpacity={0.1} />
                        );
                      }
                    } else {
                      if (domainMax > minThreshold && domainMin < maxThreshold) {
                        areas.push(
                          <ReferenceArea key="safe-zone" y1={Math.max(minThreshold, domainMin)} y2={Math.min(maxThreshold, domainMax)} fill="green" fillOpacity={0.1} />
                        );
                      }
                      if (domainMax > maxThreshold) {
                        areas.push(
                          <ReferenceArea key="critical-high" y1={Math.max(maxThreshold, domainMin)} y2={domainMax} fill="red" fillOpacity={0.1} />
                        );
                      }
                      if (domainMin < minThreshold) {
                        areas.push(
                          <ReferenceArea key="critical-low" y1={domainMin} y2={Math.min(minThreshold, domainMax)} fill="red" fillOpacity={0.1} />
                        );
                      }
                    }
                    return <>{areas}</>;
                  })()}
                  <Tooltip />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  gap: "16px",
                  marginLeft: "24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div
                    style={{
                      width: "20px",
                      height: "12px",
                      backgroundColor: "#e6ffe6",
                      border: "1px solid #ccc",
                      borderRadius: "2px",
                    }}
                  ></div>
                  <span style={{ fontSize: "14px", color: "#333" }}>
                    Non-Critical ({model?.features[feature]?.properties.minValue} - {model?.features[feature]?.properties.maxValue})
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div
                    style={{
                      width: "20px",
                      height: "12px",
                      backgroundColor: "#ffe5e5",
                      border: "1px solid #ccc",
                      borderRadius: "2px",
                    }}
                  ></div>
                  <span style={{ fontSize: "14px", color: "#333" }}>Critical</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
                if (dataAlwaysBelowMin) {
                  // Data always below minimum - force include threshold with buffer
                  domainMax = Math.max(domainMax, minThreshold + Math.abs(minThreshold - actualDataMax) * 0.1);
                } else if (dataAlwaysAboveMax) {
                  // Data always above maximum - force include threshold with buffer
                  domainMin = Math.min(domainMin, maxThreshold - Math.abs(actualDataMin - maxThreshold) * 0.1);
                } else {
                  // Data crosses or is near thresholds - extend domain if close
                  if (actualDataMin <= minThreshold + dataRange * 0.2) {
                    domainMin = Math.min(domainMin, minThreshold - Math.abs(minThreshold) * 0.05);
                  }
                  if (actualDataMax >= maxThreshold - dataRange * 0.2) {
                    domainMax = Math.max(domainMax, maxThreshold + Math.abs(maxThreshold) * 0.05);
                  }
                }
                
                // Determine which zones to show based on data position
                const areas = [];
                
                // If data is always below minimum threshold - show red background
                if (dataAlwaysBelowMin) {
                  areas.push(
                    <ReferenceArea key="critical-low" y1={domainMin} y2={domainMax} fill="red" fillOpacity={0.1} />
                  );
                  // Show green zone boundary if threshold is visible
                  if (domainMax > minThreshold) {
                    areas.push(
                      <ReferenceArea key="safe-indicator" y1={minThreshold} y2={domainMax} fill="green" fillOpacity={0.1} />
                    );
                  }
                }
                // If data is always above maximum threshold - show red background  
                else if (dataAlwaysAboveMax) {
                  areas.push(
                    <ReferenceArea key="critical-high" y1={domainMin} y2={domainMax} fill="red" fillOpacity={0.1} />
                  );
                  // Show green zone boundary if threshold is visible
                  if (domainMin < maxThreshold) {
                    areas.push(
                      <ReferenceArea key="safe-indicator" y1={domainMin} y2={maxThreshold} fill="green" fillOpacity={0.1} />
                    );
                  }
                }
                // Normal case - show zones based on thresholds
                else {
                  // Green zone between thresholds
                  if (domainMax > minThreshold && domainMin < maxThreshold) {
                    areas.push(
                      <ReferenceArea 
                        key="safe-zone"
                        y1={Math.max(minThreshold, domainMin)}
                        y2={Math.min(maxThreshold, domainMax)}
                        fill="green"
                        fillOpacity={0.1}
                      />
                    );
                  }
                  
                  // Red zone above max
                  if (domainMax > maxThreshold) {
                    areas.push(
                      <ReferenceArea 
                        key="critical-high"
                        y1={Math.max(maxThreshold, domainMin)}
                      </LineChart>
                    </ResponsiveContainer>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "12px",
                        gap: "16px",
                        marginLeft: "24px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <div
                          style={{
                            width: "20px",
                            height: "12px",
                            backgroundColor: "#e6ffe6",
                            border: "1px solid #ccc",
                            borderRadius: "2px",
                          }}
                        ></div>
                        <span style={{ fontSize: "14px", color: "#333" }}>
                          Non-Critical ({model?.features[feature]?.properties.minValue} -{" "}
                          {model?.features[feature]?.properties.maxValue})
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <div
                          style={{
                            width: "20px",
                            height: "12px",
                            backgroundColor: "#ffe5e5",
                            border: "1px solid #ccc",
                            borderRadius: "2px",
                          }}
                        ></div>
                        <span style={{ fontSize: "14px", color: "#333" }}>Critical</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
                  backgroundColor: "#e6ffe6",
                  border: "1px solid #ccc",
                  borderRadius: "2px",
                }}
              ></div>
              <span style={{ fontSize: "14px", color: "#333" }}>
                Non-Critical ({model?.features[feature]?.properties.minValue} -{" "}
                {model?.features[feature]?.properties.maxValue})
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "20px",
                  height: "12px",
                  backgroundColor: "#ffe5e5",
                  border: "1px solid #ccc",
                  borderRadius: "2px",
                }}
              ></div>
              <span style={{ fontSize: "14px", color: "#333" }}>Critical</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import * as React from "react";
import "./animation-spin.css";

export function Loading ({sizeCss} : {sizeCss?: string}) {
  if (! sizeCss) sizeCss = "20px";
  const style = {
    border: "10px solid #f3f3f3",
    borderTop: "10px solid #3498db",
    borderRadius: "50%",
    width: sizeCss,
    height: sizeCss,
    animation: "spin 1s linear infinite"
  };
  return <div className="spin" style={style}></div>;
}

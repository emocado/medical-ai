import { describe, it, expect } from "vitest";
import { canonicalMarkerId, numericValue, parseBloodPressure, toStandardUnit } from "@/lib/markers";
import { assessMarker, findUrgentFindings, needsUrgentAttention } from "@/lib/red-flags";

describe("Marker catalog", () => {
  it("maps the different names labs use to one id", () => {
    expect(canonicalMarkerId("Fasting Plasma Glucose")).toBe("fasting_glucose");
    expect(canonicalMarkerId("FBS")).toBe("fasting_glucose");
    expect(canonicalMarkerId("Random Plasma Glucose")).toBe("random_glucose");
    expect(canonicalMarkerId("HbA1c")).toBe("hba1c");
    expect(canonicalMarkerId("Haemoglobin")).toBe("haemoglobin");
    expect(canonicalMarkerId("Hemoglobin (Hb)")).toBe("haemoglobin");
    expect(canonicalMarkerId("LDL-Cholesterol")).toBe("ldl");
    expect(canonicalMarkerId("HDL-C")).toBe("hdl");
    expect(canonicalMarkerId("Total Cholesterol")).toBe("total_cholesterol");
    expect(canonicalMarkerId("eGFR (CKD-EPI)")).toBe("egfr");
    expect(canonicalMarkerId("Serum Creatinine")).toBe("creatinine");
    expect(canonicalMarkerId("Potassium")).toBe("potassium");
    expect(canonicalMarkerId("Blood Pressure")).toBe("blood_pressure");
    expect(canonicalMarkerId("Body Mass Index (BMI)")).toBe("bmi");
    expect(canonicalMarkerId("Vitamin D")).toBeNull();
  });

  it("parses numbers, blood pressure and unit conversions", () => {
    expect(numericValue("6.4 mmol/L")).toBe(6.4);
    expect(numericValue("<5.2")).toBe(5.2);
    expect(numericValue("N/A")).toBeNull();
    expect(parseBloodPressure("148/92")).toEqual({ systolic: 148, diastolic: 92 });
    expect(toStandardUnit("fasting_glucose", 360, "mg/dL")).toBeCloseTo(20);
    expect(toStandardUnit("haemoglobin", 130, "g/L")).toBe(13);
  });
});

describe("Urgent result detection", () => {
  it("flags the critical values from the sample urgent report", () => {
    const findings = findUrgentFindings({
      keyMarkers: {
        "Random Plasma Glucose": { value: 18.5, unit: "mmol/L", status: "high" },
        Potassium: { value: 6.4, unit: "mmol/L", status: "high" },
        Sodium: { value: 131, unit: "mmol/L", status: "low" },
        "eGFR (CKD-EPI)": { value: 28, unit: "mL/min/1.73m²", status: "low" },
      },
    });
    expect(findings.map((f) => f.marker)).toEqual(["Random Plasma Glucose", "Potassium"]);
    expect(findings[1]).toMatchObject({ value: "6.4 mmol/L", reason: "very-high" });
  });

  it("does not flag the ordinary abnormal values of a routine check-up", () => {
    expect(
      findUrgentFindings({
        keyMarkers: {
          "Fasting Plasma Glucose": { value: 7.8, unit: "mmol/L", status: "high" },
          "Blood Pressure": { value: "148/92", unit: "mmHg", status: "high" },
          Haemoglobin: { value: 13.1, unit: "g/dL", status: "normal" },
        },
      })
    ).toEqual([]);
  });

  it("flags lab-marked critical results, hypertensive crisis and mg/dL hypoglycaemia", () => {
    expect(assessMarker("Troponin", { value: "high", status: "critical" })?.reason).toBe("lab-critical");
    expect(assessMarker("BP", { value: "185/100" })?.reason).toBe("very-high");
    expect(assessMarker("Glucose", { value: 50, unit: "mg/dL" })?.reason).toBe("very-low");
  });

  it("also escalates when the AI judged the report urgent", () => {
    expect(needsUrgentAttention({ keyMarkers: {}, urgent: true })).toBe(true);
    expect(needsUrgentAttention({ keyMarkers: {} })).toBe(false);
  });
});

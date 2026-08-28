import argparse
import json
from pathlib import Path

from app.services.analyzer import extract_job_requirements, extract_skills


def evaluate_dataset(cases: list[dict]) -> dict:
    true_positive = false_positive = false_negative = 0
    importance_correct = importance_total = 0
    failures = []
    for case in cases:
        if case["kind"] == "job_requirements":
            requirements = extract_job_requirements(case["text"])
            actual = [item["skill"] for item in requirements]
            actual_importance = {item["skill"]: item["importance"] for item in requirements}
            for skill, expected_importance in case.get("importance", {}).items():
                importance_total += 1
                importance_correct += actual_importance.get(skill) == expected_importance
        else:
            actual = extract_skills(case["text"])
        expected_set, actual_set = set(case["expected"]), set(actual)
        true_positive += len(expected_set & actual_set)
        false_positive += len(actual_set - expected_set)
        false_negative += len(expected_set - actual_set)
        importance_failed = any(
            actual_importance.get(skill) != value
            for skill, value in case.get("importance", {}).items()
        ) if case["kind"] == "job_requirements" else False
        if expected_set != actual_set or importance_failed:
            failures.append({"name": case["name"], "expected": case["expected"], "actual": actual})
    precision = true_positive / (true_positive + false_positive) if true_positive + false_positive else 1.0
    recall = true_positive / (true_positive + false_negative) if true_positive + false_negative else 1.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "cases": len(cases), "precision": round(precision, 4), "recall": round(recall, 4),
        "f1": round(f1, 4),
        "importanceAccuracy": round(importance_correct / importance_total, 4) if importance_total else 1.0,
        "failures": failures,
    }


def main() -> None:
    default_path = Path(__file__).resolve().parents[1] / "evaluation" / "dataset.json"
    parser = argparse.ArgumentParser(description="Evaluate deterministic skill extraction.")
    parser.add_argument("dataset", nargs="?", type=Path, default=default_path)
    parser.add_argument("--minimum-f1", type=float, default=0.90)
    args = parser.parse_args()
    cases = json.loads(args.dataset.read_text(encoding="utf-8"))
    result = evaluate_dataset(cases)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    raise SystemExit(1 if result["f1"] < args.minimum_f1 or result["failures"] else 0)


if __name__ == "__main__":
    main()


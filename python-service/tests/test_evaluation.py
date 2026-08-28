import json
from pathlib import Path

from app.evaluation import evaluate_dataset


def test_curated_dataset_has_no_regressions():
    path = Path(__file__).resolve().parents[1] / "evaluation" / "dataset.json"
    result = evaluate_dataset(json.loads(path.read_text(encoding="utf-8")))
    assert result["precision"] >= 0.95
    assert result["recall"] >= 0.95
    assert result["importanceAccuracy"] >= 0.95
    assert result["failures"] == []


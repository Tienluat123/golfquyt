import json
import numpy as np
from pathlib import Path
import config


def test_scaler():
    scaler_path = (
        config.OUTPUT_ROOT / config.FINAL_FEATURE_SUBDIR / config.SCALER_FILENAME
    )
    print(f"Looking for scaler at: {scaler_path}")

    if not scaler_path.exists():
        print("Scaler file not found!")
        return

    with open(scaler_path, "r") as f:
        scaler_data = json.load(f)

    print("Scaler loaded. Keys:", scaler_data.keys())

    j_mean = np.array(scaler_data["joint_mean"], dtype=np.float32)
    j_std = np.array(scaler_data["joint_std"], dtype=np.float32)
    g_mean = np.array(scaler_data["global_mean"], dtype=np.float32)
    g_std = np.array(scaler_data["global_std"], dtype=np.float32)

    print(f"j_mean shape: {j_mean.shape}")
    print(f"j_std shape: {j_std.shape}")
    print(f"g_mean shape: {g_mean.shape}")
    print(f"g_std shape: {g_std.shape}")

    # Simulate data
    T = 100
    joint_feats = np.random.randn(T, 33, 13).astype(np.float32)
    global_feats = np.random.randn(T, 3).astype(np.float32)

    print(f"joint_feats shape: {joint_feats.shape}")
    print(f"global_feats shape: {global_feats.shape}")

    # Normalize
    try:
        joint_feats_norm = (joint_feats - j_mean) / j_std
        global_feats_norm = (global_feats - g_mean) / g_std
        print("Normalization successful!")
        print(f"joint_feats_norm mean: {joint_feats_norm.mean()}")
    except Exception as e:
        print(f"Normalization failed: {e}")


if __name__ == "__main__":
    test_scaler()

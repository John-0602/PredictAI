import os
import math
import numpy as np
import pandas as pd
from app.config import DATASET_PATH

class EDAService:
    def __init__(self):
        self.df = None
        self.cached_summary = None
        self.cached_correlations = None
        self.cached_distributions = None
        self.load_and_process_data()

    def load_and_process_data(self):
        if not os.path.exists(DATASET_PATH):
            print(f"Dataset path does not exist: {DATASET_PATH}")
            return
            
        df = pd.read_csv(DATASET_PATH)
        # Add physics-informed features
        df['Temp_difference'] = df['Process temperature [K]'] - df['Air temperature [K]']
        df['Power_W'] = df['Rotational speed [rpm]'] * (2 * math.pi / 60.0) * df['Torque [Nm]']
        df['Tool_overstrain'] = df['Tool wear [min]'] * df['Torque [Nm]']
        self.df = df
        print(f"EDAService initialized with {len(df)} records.")

    def get_dataset_summary(self):
        if self.df is None:
            self.load_and_process_data()
        if self.cached_summary:
            return self.cached_summary

        df = self.df
        numeric_cols = [
            'Air temperature [K]', 'Process temperature [K]',
            'Rotational speed [rpm]', 'Torque [Nm]', 'Tool wear [min]',
            'Temp_difference', 'Power_W', 'Tool_overstrain'
        ]
        
        stats = {}
        for col in numeric_cols:
            s = df[col]
            stats[col] = {
                "mean": round(float(s.mean()), 2),
                "std": round(float(s.std()), 2),
                "min": round(float(s.min()), 2),
                "q25": round(float(s.quantile(0.25)), 2),
                "median": round(float(s.median()), 2),
                "q75": round(float(s.quantile(0.75)), 2),
                "max": round(float(s.max()), 2),
                "skew": round(float(s.skew()), 2)
            }

        columns_info = []
        for col in df.columns:
            dtype_str = str(df[col].dtype)
            missing = int(df[col].isnull().sum())
            unique_count = int(df[col].nunique())
            sample_val = str(df[col].iloc[0])
            columns_info.append({
                "name": col,
                "dtype": dtype_str,
                "missing_count": missing,
                "missing_pct": 0.0,
                "unique_count": unique_count,
                "sample": sample_val
            })

        total_records = len(df)
        total_failures = int(df['Machine failure'].sum())
        failure_rate = round(float(total_failures / total_records * 100), 2)
        duplicates_count = int(df.duplicated(subset=['Product ID']).sum())

        # Type distribution
        type_counts = df['Type'].value_counts().to_dict()
        type_dist = [
            {"type": k, "count": int(v), "percentage": round(float(v / total_records * 100), 1)}
            for k, v in type_counts.items()
        ]

        # Failure modes breakdown
        modes = ['TWF', 'HDF', 'PWF', 'OSF', 'RNF']
        failure_breakdown = []
        for m in modes:
            cnt = int(df[m].sum())
            failure_breakdown.append({
                "mode": m,
                "name": {
                    "TWF": "Tool Wear Failure",
                    "HDF": "Heat Dissipation Failure",
                    "PWF": "Power Failure",
                    "OSF": "Overstrain Failure",
                    "RNF": "Random Failure"
                }.get(m, m),
                "count": cnt,
                "percentage_of_all_failures": round(float(cnt / total_failures * 100), 1) if total_failures > 0 else 0
            })

        self.cached_summary = {
            "total_records": total_records,
            "total_features": len(df.columns),
            "duplicates_count": duplicates_count,
            "total_failures": total_failures,
            "normal_count": total_records - total_failures,
            "failure_rate": failure_rate,
            "columns_info": columns_info,
            "numeric_stats": stats,
            "type_distribution": type_dist,
            "failure_breakdown": failure_breakdown
        }
        return self.cached_summary

    def get_correlations(self):
        if self.df is None:
            self.load_and_process_data()
        if self.cached_correlations:
            return self.cached_correlations

        cols = [
            'Air temperature [K]', 'Process temperature [K]',
            'Rotational speed [rpm]', 'Torque [Nm]', 'Tool wear [min]',
            'Temp_difference', 'Power_W', 'Tool_overstrain',
            'Machine failure'
        ]
        corr_matrix = self.df[cols].corr().round(3)
        
        matrix_data = []
        for col_y in cols:
            row = {"feature": col_y}
            for col_x in cols:
                row[col_x] = float(corr_matrix.loc[col_y, col_x])
            matrix_data.append(row)

        self.cached_correlations = {
            "features": cols,
            "matrix": matrix_data
        }
        return self.cached_correlations

    def get_distributions(self):
        if self.df is None:
            self.load_and_process_data()
        if self.cached_distributions:
            return self.cached_distributions

        df = self.df
        numeric_cols = [
            'Air temperature [K]', 'Process temperature [K]',
            'Rotational speed [rpm]', 'Torque [Nm]', 'Tool wear [min]',
            'Temp_difference', 'Power_W'
        ]
        
        dist_dict = {}
        for col in numeric_cols:
            series = df[col]
            bins = 15
            counts, bin_edges = np.histogram(series, bins=bins)
            
            # Failure vs Non-failure breakdown per bin
            normal_counts, _ = np.histogram(series[df['Machine failure'] == 0], bins=bin_edges)
            failure_counts, _ = np.histogram(series[df['Machine failure'] == 1], bins=bin_edges)
            
            hist_data = []
            for i in range(len(counts)):
                label = f"{bin_edges[i]:.1f} - {bin_edges[i+1]:.1f}"
                hist_data.append({
                    "bin_range": label,
                    "bin_center": round(float((bin_edges[i] + bin_edges[i+1]) / 2), 2),
                    "total": int(counts[i]),
                    "normal": int(normal_counts[i]),
                    "failure": int(failure_counts[i])
                })
            dist_dict[col] = hist_data

        # Failure vs Normal comparison table
        comparison = {}
        for col in numeric_cols:
            norm_series = df[df['Machine failure'] == 0][col]
            fail_series = df[df['Machine failure'] == 1][col]
            comparison[col] = {
                "normal_mean": round(float(norm_series.mean()), 2),
                "normal_median": round(float(norm_series.median()), 2),
                "normal_std": round(float(norm_series.std()), 2),
                "failure_mean": round(float(fail_series.mean()), 2),
                "failure_median": round(float(fail_series.median()), 2),
                "failure_std": round(float(fail_series.std()), 2),
                "difference_pct": round(float((fail_series.mean() - norm_series.mean()) / (norm_series.mean() or 1) * 100), 1)
            }

        self.cached_distributions = {
            "histograms": dist_dict,
            "comparison": comparison
        }
        return self.cached_distributions

    def get_scatter_samples(self, sample_size=400):
        if self.df is None:
            self.load_and_process_data()

        df = self.df
        # Include all failures plus sampled normal records
        failures = df[df['Machine failure'] == 1]
        normals = df[df['Machine failure'] == 0].sample(n=min(sample_size - len(failures), len(df) - len(failures)), random_state=42)
        sample_df = pd.concat([failures, normals]).sample(frac=1, random_state=42)

        scatter_points = []
        for _, row in sample_df.iterrows():
            scatter_points.append({
                "udi": int(row['UDI']),
                "type": str(row['Type']),
                "air_temp": round(float(row['Air temperature [K]']), 1),
                "process_temp": round(float(row['Process temperature [K]']), 1),
                "rot_speed": int(row['Rotational speed [rpm]']),
                "torque": round(float(row['Torque [Nm]']), 1),
                "tool_wear": int(row['Tool wear [min]']),
                "power_w": round(float(row['Power_W']), 0),
                "temp_diff": round(float(row['Temp_difference']), 2),
                "machine_failure": int(row['Machine failure'])
            })
        return scatter_points

    def get_paginated_data(self, page=1, page_size=20, search="", machine_type=None, failure_only=None):
        if self.df is None:
            self.load_and_process_data()

        filtered = self.df.copy()
        if machine_type and machine_type in ['L', 'M', 'H']:
            filtered = filtered[filtered['Type'] == machine_type]
        if failure_only is not None:
            filtered = filtered[filtered['Machine failure'] == (1 if failure_only else 0)]
        if search:
            s = search.lower()
            filtered = filtered[
                filtered['Product ID'].str.lower().str.contains(s) |
                filtered['UDI'].astype(str).str.contains(s)
            ]

        total = len(filtered)
        start = (page - 1) * page_size
        end = start + page_size
        page_records = filtered.iloc[start:end].to_dict(orient='records')
        
        # Clean records for JSON
        clean_records = []
        for r in page_records:
            clean_records.append({
                "udi": int(r['UDI']),
                "product_id": str(r['Product ID']),
                "type": str(r['Type']),
                "air_temp": round(float(r['Air temperature [K]']), 1),
                "process_temp": round(float(r['Process temperature [K]']), 1),
                "rot_speed": int(r['Rotational speed [rpm]']),
                "torque": round(float(r['Torque [Nm]']), 1),
                "tool_wear": int(r['Tool wear [min]']),
                "machine_failure": int(r['Machine failure']),
                "twf": int(r['TWF']),
                "hdf": int(r['HDF']),
                "pwf": int(r['PWF']),
                "osf": int(r['OSF']),
                "rnf": int(r['RNF']),
                "temp_diff": round(float(r['Temp_difference']), 2),
                "power_w": round(float(r['Power_W']), 1)
            })

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": math.ceil(total / page_size) if total > 0 else 1,
            "records": clean_records
        }

eda_service = EDAService()

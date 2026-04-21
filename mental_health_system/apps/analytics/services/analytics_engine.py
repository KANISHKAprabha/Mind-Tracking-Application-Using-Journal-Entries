"""
Analytics engine — orchestrates all analytics pure functions.
This is the single entry point for computing all metrics from a list of scores.
"""
from apps.analytics.services.trend import rolling_average, overall_trend
from apps.analytics.services.volatility import calculate_volatility
from apps.analytics.services.distribution import calculate_distribution


def compute_analytics(scores, window=7):
    """
    Run all analytics on a list of sentiment scores (oldest → newest).
    Returns a dict with trend, volatility, and distribution data.
    """
    return {
        "rolling_averages": rolling_average(scores, window),
        "trend": overall_trend(scores, window),
        "volatility": calculate_volatility(scores),
        "distribution": calculate_distribution(scores),
        "entry_count": len(scores),
    }

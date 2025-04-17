import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import random
import sys
import os

# Add the parent directory to sys.path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.database import setup_database, get_all_visualizations, get_visualization_stats

# Page config
st.set_page_config(
    page_title="Dashboard | DataViz Tool",
    page_icon="📊",
    layout="wide"
)

# Initialize database connection
if 'db_engine' not in st.session_state:
    st.session_state.db_engine = setup_database()

# Title and description
st.title("📊 Analytics Dashboard")
st.write("Metrics and insights from your visualizations")

# Get visualization statistics
viz_stats = get_visualization_stats(st.session_state.db_engine)
all_vizs = get_all_visualizations(st.session_state.db_engine)

# Dashboard metrics
col1, col2, col3 = st.columns(3)

with col1:
    st.metric(
        "Total Visualizations", 
        viz_stats['total_count'],
        delta=None
    )

with col2:
    st.metric(
        "Total Views", 
        viz_stats['total_views'],
        delta=None
    )

with col3:
    avg_views = viz_stats['total_views'] / viz_stats['total_count'] if viz_stats['total_count'] > 0 else 0
    st.metric(
        "Average Views per Visualization", 
        f"{avg_views:.1f}",
        delta=None
    )

# Visualization type distribution
st.subheader("Visualization Types")

# Create data for viz type chart
if viz_stats['popular_types']:
    viz_type_data = pd.DataFrame({
        'Type': list(viz_stats['popular_types'].keys()),
        'Count': list(viz_stats['popular_types'].values())
    })
    
    fig = px.bar(
        viz_type_data, 
        x='Type', 
        y='Count',
        color='Type',
        title="Visualization Types Used"
    )
    
    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("No visualization data available yet.")

# Recent activity
st.subheader("Recent Visualizations")

if all_vizs:
    # Create a table of recent visualizations
    recent_vizs = all_vizs[:10]  # Get the 10 most recent
    
    # Format the data for display
    recent_data = []
    for viz in recent_vizs:
        created_at = viz.get('created_at')
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at)
            except:
                created_at = "Unknown"
        
        recent_data.append({
            'ID': viz.get('id', '')[:8] + '...',
            'Name': viz.get('name', 'Unnamed Visualization'),
            'Type': viz.get('viz_type', 'Unknown'),
            'Created': created_at,
            'Views': viz.get('views', 0),
            'Query': viz.get('query', '')[:50] + ('...' if len(viz.get('query', '')) > 50 else '')
        })
    
    recent_df = pd.DataFrame(recent_data)
    st.dataframe(recent_df, use_container_width=True)
    
    # Add a view button
    selected_viz_id = st.selectbox(
        "Select a visualization to view",
        options=[viz.get('id') for viz in recent_vizs],
        format_func=lambda x: next((viz.get('name', 'Unnamed') for viz in recent_vizs if viz.get('id') == x), 'Unknown')
    )
    
    if selected_viz_id:
        st.button(
            "View Visualization", 
            on_click=lambda: st.switch_page("pages/visualizations.py?id=" + selected_viz_id)
        )
else:
    st.info("No visualizations have been created yet.")

# Usage trends over time
st.subheader("Usage Trends")

# If we have real data, we can use it, otherwise generate sample data
if all_vizs:
    # Try to extract dates for a time series
    dates = []
    for viz in all_vizs:
        created_at = viz.get('created_at')
        if isinstance(created_at, str):
            try:
                dates.append(datetime.fromisoformat(created_at))
            except:
                pass
        elif isinstance(created_at, datetime):
            dates.append(created_at)
    
    if dates:
        # Group by day
        date_counts = {}
        for date in dates:
            day = date.date()
            date_counts[day] = date_counts.get(day, 0) + 1
        
        # Convert to dataframe
        trend_data = pd.DataFrame({
            'Date': list(date_counts.keys()),
            'Visualizations Created': list(date_counts.values())
        }).sort_values('Date')
        
        fig = px.line(
            trend_data, 
            x='Date', 
            y='Visualizations Created',
            title="Visualizations Created Over Time"
        )
        
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Not enough time data available for trends.")
else:
    st.info("No visualization data available yet for trends.")

# Footer
st.markdown("---")
st.markdown(
    "Made with ❤️ for creatives | "
    "[Home](/) | [Saved Visualizations](/visualizations) | [About](/about)"
)

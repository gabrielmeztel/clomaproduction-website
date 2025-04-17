import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json
import sys
import os
from datetime import datetime
import base64
import io

# Add the parent directory to sys.path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.database import setup_database, get_visualization_by_id, get_all_visualizations, delete_visualization

# Page config
st.set_page_config(
    page_title="Visualizations | DataViz Tool",
    page_icon="📊",
    layout="wide"
)

# Initialize database connection
if 'db_engine' not in st.session_state:
    st.session_state.db_engine = setup_database()

# Get visualization ID from URL parameter
query_params = st.experimental_get_query_params()
selected_viz_id = query_params.get('id', [None])[0]

# Title
st.title("📊 Saved Visualizations")

# Display either a specific visualization or the gallery
if selected_viz_id:
    # Get the visualization by ID
    viz = get_visualization_by_id(st.session_state.db_engine, selected_viz_id)
    
    if viz:
        # Display visualization
        st.header(viz.get('name', 'Visualization'))
        
        # Show metadata
        col1, col2, col3 = st.columns(3)
        
        with col1:
            created_at = viz.get('created_at')
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at)
                    created_at = created_at.strftime("%Y-%m-%d %H:%M")
                except:
                    pass
            elif isinstance(created_at, datetime):
                created_at = created_at.strftime("%Y-%m-%d %H:%M")
                
            st.write(f"**Created:** {created_at}")
        
        with col2:
            st.write(f"**Type:** {viz.get('viz_type', 'Unknown')}")
        
        with col3:
            st.write(f"**Views:** {viz.get('views', 0)}")
        
        # Display the query and SQL
        with st.expander("View query details"):
            st.write("**Original question:**")
            st.write(viz.get('query', 'N/A'))
            
            st.write("**SQL query:**")
            st.code(viz.get('sql', 'N/A'), language="sql")
        
        # Display the visualization
        try:
            viz_data = json.loads(viz.get('data', '{}'))
            fig = go.Figure(viz_data)
            st.plotly_chart(fig, use_container_width=True)
            
            # Export options
            st.subheader("Export Visualization")
            col1, col2 = st.columns(2)
            
            with col1:
                export_format = st.selectbox(
                    "Export Format",
                    ["PNG", "SVG", "HTML", "JSON"]
                )
            
            with col2:
                if st.button("Export", use_container_width=True):
                    if export_format == "PNG":
                        buf = io.BytesIO()
                        fig.write_image(buf, format="png")
                        buf.seek(0)
                        b64 = base64.b64encode(buf.read()).decode()
                        href = f'<a href="data:image/png;base64,{b64}" download="visualization.png">Download PNG</a>'
                        st.markdown(href, unsafe_allow_html=True)
                        
                    elif export_format == "SVG":
                        buf = io.BytesIO()
                        fig.write_image(buf, format="svg")
                        buf.seek(0)
                        b64 = base64.b64encode(buf.read()).decode()
                        href = f'<a href="data:image/svg+xml;base64,{b64}" download="visualization.svg">Download SVG</a>'
                        st.markdown(href, unsafe_allow_html=True)
                        
                    elif export_format == "HTML":
                        html_str = fig.to_html()
                        b64 = base64.b64encode(html_str.encode()).decode()
                        href = f'<a href="data:text/html;base64,{b64}" download="visualization.html">Download HTML</a>'
                        st.markdown(href, unsafe_allow_html=True)
                        
                    elif export_format == "JSON":
                        json_str = json.dumps(viz_data)
                        b64 = base64.b64encode(json_str.encode()).decode()
                        href = f'<a href="data:application/json;base64,{b64}" download="visualization.json">Download JSON</a>'
                        st.markdown(href, unsafe_allow_html=True)
        except Exception as e:
            st.error(f"Error rendering visualization: {str(e)}")
        
        # Share link
        st.subheader("Share Visualization")
        viz_url = f"{st.request_url_root}visualizations?id={selected_viz_id}"
        st.code(viz_url)
        
        # Delete option
        if st.button("Delete Visualization", type="primary"):
            if delete_visualization(st.session_state.db_engine, selected_viz_id):
                st.success("Visualization deleted successfully!")
                st.experimental_set_query_params()  # Clear the query parameter
                st.rerun()
            else:
                st.error("Failed to delete visualization.")
    else:
        st.error("Visualization not found. It may have been deleted or the ID is incorrect.")
        # Gallery button
        if st.button("View All Visualizations"):
            st.experimental_set_query_params()  # Clear the query parameter
            st.rerun()
else:
    # Display gallery of visualizations
    st.write("Browse and manage your saved visualizations")
    
    # Get all visualizations
    all_vizs = get_all_visualizations(st.session_state.db_engine)
    
    if all_vizs:
        # Create a grid layout for the gallery
        num_cols = 3
        cols = st.columns(num_cols)
        
        for i, viz in enumerate(all_vizs):
            col = cols[i % num_cols]
            
            with col:
                st.markdown(f"#### {viz.get('name', 'Visualization')}")
                
                # Display metadata
                created_at = viz.get('created_at')
                if isinstance(created_at, str):
                    try:
                        created_at = datetime.fromisoformat(created_at)
                        created_at = created_at.strftime("%Y-%m-%d")
                    except:
                        pass
                elif isinstance(created_at, datetime):
                    created_at = created_at.strftime("%Y-%m-%d")
                    
                st.write(f"Created: {created_at} | Views: {viz.get('views', 0)}")
                
                # Try to render a preview
                try:
                    viz_data = json.loads(viz.get('data', '{}'))
                    fig = go.Figure(viz_data)
                    
                    # Simplify the figure for preview
                    fig.update_layout(
                        height=200,
                        margin=dict(l=10, r=10, t=30, b=10),
                        xaxis_title=None,
                        yaxis_title=None
                    )
                    
                    st.plotly_chart(fig, use_container_width=True)
                except:
                    st.info("Preview not available")
                
                # View button
                if st.button(f"View", key=f"view_{viz.get('id')}", use_container_width=True):
                    st.experimental_set_query_params(id=viz.get('id'))
                    st.rerun()
                
                st.markdown("---")
    else:
        st.info("No visualizations have been saved yet. Create visualizations from the home page.")

# Footer
st.markdown("---")
st.markdown(
    "Made with ❤️ for creatives | "
    "[Home](/) | [Dashboard](/dashboard) | [About](/about)"
)

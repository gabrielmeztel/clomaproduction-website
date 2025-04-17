import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import uuid
import base64
import io
import json
import os
from datetime import datetime
from utils.data_loader import load_data, supported_file_types
from utils.query_translator import translate_to_sql
from utils.visualization import generate_visualization, get_visualization_types
from utils.database import setup_database, save_visualization, get_visualization_by_id

# Page configuration
st.set_page_config(
    page_title="DataViz - Creative Data Tool",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state variables
if 'data' not in st.session_state:
    st.session_state.data = None
    
if 'query_history' not in st.session_state:
    st.session_state.query_history = []
    
if 'current_viz' not in st.session_state:
    st.session_state.current_viz = None
    
if 'db_engine' not in st.session_state:
    st.session_state.db_engine = setup_database()

# Title and description
st.title("📊 DataViz - Creative Data Tool")
st.markdown("""
Transform your data into actionable insights through natural language.
Upload your data, ask questions, and create beautiful visualizations to share.
""")

# Sidebar for data upload and options
with st.sidebar:
    st.header("Data Controls")
    
    uploaded_file = st.file_uploader(
        "Upload your data file", 
        type=supported_file_types(),
        help="Supported file types: CSV, Excel (.xlsx, .xls)"
    )
    
    if uploaded_file is not None:
        try:
            file_details = {"filename": uploaded_file.name, "file_size": uploaded_file.size}
            st.write(f"**Selected file:** {file_details['filename']}")
            
            data = load_data(uploaded_file)
            st.session_state.data = data
            
            if data is not None:
                st.success(f"Data loaded successfully! {len(data)} rows and {len(data.columns)} columns.")
                
                # Display column information
                st.subheader("Data Columns")
                columns = data.columns.tolist()
                col_types = data.dtypes.astype(str).tolist()
                
                for col, col_type in zip(columns, col_types):
                    st.write(f"- **{col}** ({col_type})")
                    
        except Exception as e:
            st.error(f"Error loading data: {str(e)}")
    
    st.divider()
    
    # Quick examples section
    st.subheader("Example Questions")
    example_questions = [
        "Show me total sales by month",
        "What are the top 5 products by revenue?",
        "Show the distribution of project durations",
        "Compare performance across different categories"
    ]
    
    for question in example_questions:
        if st.button(question):
            st.session_state.current_query = question
            st.rerun()

# Main content area
if st.session_state.data is None:
    st.info("👈 Please upload a data file to get started.")
    
    # Example visualization to demonstrate capabilities
    st.header("What you can do with DataViz")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Natural Language Queries")
        st.markdown("""
        - Ask questions about your data in plain English
        - Automatically translate to SQL queries
        - Get instant visual insights
        """)
        
    with col2:
        st.subheader("Interactive Visualizations")
        st.markdown("""
        - Create beautiful, interactive charts
        - Customize visualizations to your needs
        - Share with teammates via unique links
        - Export in various formats
        """)
        
else:
    # Data preview
    with st.expander("Data Preview", expanded=False):
        st.dataframe(st.session_state.data.head(10), use_container_width=True)
    
    # Query input section
    st.subheader("Ask a question about your data")
    
    query_input = st.text_input(
        "Type your question in natural language:", 
        key="current_query",
        help="Example: 'Show me sales trends by month' or 'What are my top customers?'"
    )
    
    col1, col2 = st.columns([3, 1])
    
    with col1:
        analyze_button = st.button("Analyze Data", type="primary", use_container_width=True)
    
    with col2:
        viz_type = st.selectbox(
            "Visualization Type", 
            get_visualization_types(),
            help="Select 'Auto' to let the system choose the best visualization type"
        )
    
    # Process query
    if analyze_button and query_input:
        try:
            with st.spinner("Analyzing your data..."):
                # Translate natural language to SQL
                sql_query, explanation = translate_to_sql(query_input, st.session_state.data)
                
                # Add to query history
                st.session_state.query_history.append({
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "natural_query": query_input,
                    "sql_query": sql_query
                })
                
                # Generate visualization
                fig, result_data = generate_visualization(
                    st.session_state.data, 
                    sql_query, 
                    viz_type, 
                    query_input
                )
                
                st.session_state.current_viz = {
                    "figure": fig,
                    "data": result_data,
                    "query": query_input,
                    "sql": sql_query,
                    "type": viz_type,
                    "id": str(uuid.uuid4())
                }
            
            # Show SQL translation
            with st.expander("View SQL Translation", expanded=False):
                st.code(sql_query, language="sql")
                st.markdown("**Explanation:**")
                st.markdown(explanation)
            
            # Display visualization
            if st.session_state.current_viz and st.session_state.current_viz["figure"]:
                st.subheader("Visualization Result")
                st.plotly_chart(st.session_state.current_viz["figure"], use_container_width=True)
                
                # Visualization actions
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    if st.button("Save Visualization", use_container_width=True):
                        viz_id = save_visualization(
                            st.session_state.db_engine,
                            st.session_state.current_viz["id"],
                            st.session_state.current_viz["query"],
                            st.session_state.current_viz["sql"],
                            st.session_state.current_viz["type"],
                            json.dumps(st.session_state.current_viz["figure"].to_dict())
                        )
                        st.success(f"Visualization saved! Share using this link: `/visualizations?id={viz_id}`")
                
                with col2:
                    # Export options
                    export_format = st.selectbox(
                        "Export Format",
                        ["PNG", "SVG", "HTML", "CSV"]
                    )
                
                with col3:
                    if st.button("Export", use_container_width=True):
                        if export_format == "PNG":
                            buf = io.BytesIO()
                            st.session_state.current_viz["figure"].write_image(buf, format="png")
                            buf.seek(0)
                            b64 = base64.b64encode(buf.read()).decode()
                            href = f'<a href="data:image/png;base64,{b64}" download="visualization.png">Download PNG</a>'
                            st.markdown(href, unsafe_allow_html=True)
                            
                        elif export_format == "SVG":
                            buf = io.BytesIO()
                            st.session_state.current_viz["figure"].write_image(buf, format="svg")
                            buf.seek(0)
                            b64 = base64.b64encode(buf.read()).decode()
                            href = f'<a href="data:image/svg+xml;base64,{b64}" download="visualization.svg">Download SVG</a>'
                            st.markdown(href, unsafe_allow_html=True)
                            
                        elif export_format == "HTML":
                            html_str = st.session_state.current_viz["figure"].to_html()
                            b64 = base64.b64encode(html_str.encode()).decode()
                            href = f'<a href="data:text/html;base64,{b64}" download="visualization.html">Download HTML</a>'
                            st.markdown(href, unsafe_allow_html=True)
                            
                        elif export_format == "CSV":
                            csv = st.session_state.current_viz["data"].to_csv(index=False)
                            b64 = base64.b64encode(csv.encode()).decode()
                            href = f'<a href="data:text/csv;base64,{b64}" download="visualization_data.csv">Download CSV</a>'
                            st.markdown(href, unsafe_allow_html=True)
        
        except Exception as e:
            st.error(f"Error analyzing data: {str(e)}")
    
    # Query history
    if st.session_state.query_history:
        with st.expander("Query History", expanded=False):
            for i, query in enumerate(reversed(st.session_state.query_history)):
                st.markdown(f"**{query['timestamp']}**: {query['natural_query']}")
                if st.button(f"Rerun #{i+1}", key=f"rerun_{i}"):
                    st.session_state.current_query = query['natural_query']
                    st.rerun()
                st.divider()

# Footer
st.markdown("---")
st.markdown(
    "Made with ❤️ for creatives | "
    "[Dashboard](/dashboard) | [Saved Visualizations](/visualizations) | [About](/about)"
)

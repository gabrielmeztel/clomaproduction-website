import streamlit as st

# Page config
st.set_page_config(
    page_title="About | DataViz Tool",
    page_icon="📊"
)

# Title and description
st.title("About DataViz Tool")
st.write("A powerful data analysis and visualization tool for creatives")

# Overview
st.header("Overview")
st.markdown("""
DataViz is designed to help creatives analyze their data and create compelling visualizations without requiring technical expertise. The tool allows you to:

- Upload and process various data formats (CSV, Excel)
- Ask questions about your data in natural language
- Automatically generate beautiful visualizations
- Save and share visualizations with others
- Export in multiple formats for presentations and reports
- Track visualization metrics through a dashboard
""")

# How it works
st.header("How It Works")
st.markdown("""
1. **Upload your data**: Start by uploading your CSV or Excel file
2. **Ask questions**: Type questions about your data in plain English
3. **Get insights**: The tool automatically translates your questions to SQL and generates visualizations
4. **Customize**: Adjust visualization types and settings to fit your needs
5. **Share**: Save visualizations and share them with unique links
""")

# Features
st.header("Key Features")

col1, col2 = st.columns(2)

with col1:
    st.subheader("Natural Language Processing")
    st.markdown("""
    - Ask questions in plain English
    - No need to learn SQL or query languages
    - Automatic translation to database queries
    - Support for complex analytical questions
    """)
    
    st.subheader("Interactive Visualizations")
    st.markdown("""
    - Beautiful, interactive charts and graphs
    - Multiple visualization types
    - Hover for detailed information
    - Zoom and filter capabilities
    """)

with col2:
    st.subheader("Data Processing")
    st.markdown("""
    - Support for CSV and Excel files
    - Automatic data type detection
    - Handling of large datasets
    - Basic data cleaning capabilities
    """)
    
    st.subheader("Sharing & Collaboration")
    st.markdown("""
    - Generate unique links for each visualization
    - Export in multiple formats (PNG, SVG, HTML)
    - Track views and engagement
    - Dashboard for visualization metrics
    """)

# Use cases
st.header("Ideal Use Cases")
st.markdown("""
DataViz is perfect for:

- **Marketing teams** analyzing campaign performance
- **Content creators** looking to understand audience engagement
- **Design studios** tracking project metrics
- **Freelancers** creating client reports
- **Small businesses** making data-driven decisions
- **Educators** creating visual learning materials
""")

# Example queries
st.header("Example Questions You Can Ask")
example_questions = [
    "What were our top performing campaigns last quarter?",
    "Show me the trend of user engagement over the past year",
    "Which products have the highest profit margin?",
    "Compare sales performance across different regions",
    "What's the distribution of project completion times?",
    "Show me customer demographics by age group",
    "What days of the week have the highest social media engagement?"
]

for question in example_questions:
    st.markdown(f"- {question}")

# Footer
st.markdown("---")
st.markdown(
    "Made with ❤️ for creatives | "
    "[Home](/) | [Dashboard](/dashboard) | [Saved Visualizations](/visualizations)"
)

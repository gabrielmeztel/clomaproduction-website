import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
from pandasql import sqldf
import re

def get_visualization_types():
    """Returns a list of supported visualization types."""
    return [
        "Auto", 
        "Bar Chart", 
        "Line Chart", 
        "Pie Chart",
        "Scatter Plot",
        "Histogram",
        "Box Plot",
        "Bubble Chart", 
        "Heatmap",
        "Area Chart",
        "Treemap",
        "Table"
    ]

def generate_visualization(data, sql_query, viz_type, query_text):
    """
    Generates a visualization based on SQL query results.
    
    Args:
        data (DataFrame): Original pandas DataFrame
        sql_query (str): SQL query to execute
        viz_type (str): Type of visualization to generate
        query_text (str): Original natural language query
        
    Returns:
        tuple: (plotly figure, result DataFrame)
    """
    try:
        # Execute the SQL query
        result = execute_query(data, sql_query)
        
        if result is None or result.empty:
            fig = go.Figure()
            fig.add_annotation(
                text="No data available for visualization",
                showarrow=False,
                font=dict(size=20)
            )
            return fig, pd.DataFrame()
        
        # Auto-detect visualization type if set to Auto
        if viz_type == "Auto":
            viz_type = auto_detect_viz_type(result, query_text)
        
        # Generate the appropriate visualization
        fig = create_visualization(result, viz_type, query_text)
        
        return fig, result
    
    except Exception as e:
        # Create an error visualization
        fig = go.Figure()
        fig.add_annotation(
            text=f"Error generating visualization: {str(e)}",
            showarrow=False,
            font=dict(size=16)
        )
        return fig, pd.DataFrame()

def execute_query(data, sql_query):
    """
    Executes a SQL query on a pandas DataFrame.
    
    Args:
        data (DataFrame): Pandas DataFrame
        sql_query (str): SQL query to execute
        
    Returns:
        DataFrame: Result of the query
    """
    try:
        # Define the local SQLite environment
        def run_query(q):
            return sqldf(q, {"data": data})
        
        # Execute the query
        result = run_query(sql_query)
        return result
    
    except Exception as e:
        raise Exception(f"Error executing SQL query: {str(e)}")

def auto_detect_viz_type(data, query_text):
    """
    Automatically detects the most appropriate visualization type.
    
    Args:
        data (DataFrame): Result data
        query_text (str): Original natural language query
        
    Returns:
        str: Recommended visualization type
    """
    num_rows, num_cols = data.shape
    
    # Check for explicit visualization mentions in the query
    query_lower = query_text.lower()
    
    if any(term in query_lower for term in ['pie', 'percentage', 'proportion', 'breakdown']):
        return "Pie Chart"
    elif any(term in query_lower for term in ['line', 'trend', 'over time', 'timeseries']):
        return "Line Chart"
    elif any(term in query_lower for term in ['scatter', 'correlation', 'relationship']):
        return "Scatter Plot"
    elif any(term in query_lower for term in ['box', 'distribution', 'spread']):
        return "Box Plot"
    elif any(term in query_lower for term in ['heat', 'matrix', 'correlation']):
        return "Heatmap"
    elif any(term in query_lower for term in ['histogram', 'frequency']):
        return "Histogram"
    elif any(term in query_lower for term in ['area', 'cumulative']):
        return "Area Chart"
    elif any(term in query_lower for term in ['tree', 'hierarchy']):
        return "Treemap"
    
    # Analyze data structure for auto-detection
    numeric_cols = data.select_dtypes(include=['number']).columns.tolist()
    categorical_cols = [col for col in data.columns if col not in numeric_cols]
    
    # Detect time series data
    has_date = any(pd.api.types.is_datetime64_dtype(data[col]) for col in data.columns)
    date_pattern = re.compile(r'date|time|year|month|day', re.IGNORECASE)
    possible_date_cols = [col for col in data.columns if date_pattern.search(str(col))]
    
    if has_date or possible_date_cols:
        if len(numeric_cols) >= 1:
            return "Line Chart"  # Time series data with numeric values
    
    # Handle different data shapes
    if num_cols <= 2 and len(numeric_cols) == 1 and len(categorical_cols) == 1:
        if data[categorical_cols[0]].nunique() <= 10:
            return "Bar Chart"  # Few categories with one numeric value
        else:
            return "Box Plot"  # Many categories with one numeric value
    
    elif num_cols == 1:
        if data[data.columns[0]].dtype.kind in 'ifc':  # Numeric column
            return "Histogram"  # Distribution of a single numeric variable
        else:
            return "Bar Chart"  # Count of categories
    
    elif len(numeric_cols) >= 2 and len(categorical_cols) <= 1:
        if len(numeric_cols) == 2:
            return "Scatter Plot"  # Two numeric variables
        else:
            if len(categorical_cols) == 1 and data[categorical_cols[0]].nunique() <= 10:
                return "Bar Chart"  # Multiple numeric variables grouped by category
            else:
                return "Table"  # Multiple numeric variables, no clear categories
    
    elif len(categorical_cols) >= 2 and len(numeric_cols) >= 1:
        if data[categorical_cols[0]].nunique() * data[categorical_cols[1]].nunique() <= 100:
            return "Heatmap"  # Two categories with numeric values
        else:
            return "Bar Chart"  # Multiple categories with numeric values
    
    elif len(categorical_cols) >= 1 and len(numeric_cols) == 1:
        if data[categorical_cols[0]].nunique() <= 10:
            return "Pie Chart" if data[categorical_cols[0]].nunique() <= 7 else "Bar Chart"
        else:
            return "Bar Chart"
    
    # Default to bar chart for most other cases
    return "Bar Chart"

def create_visualization(data, viz_type, query_text):
    """
    Creates a plotly visualization based on the specified type.
    
    Args:
        data (DataFrame): Result data
        viz_type (str): Type of visualization to create
        query_text (str): Original natural language query
        
    Returns:
        Figure: Plotly figure object
    """
    # Ensure the data has meaningful column names
    data.columns = [str(col) for col in data.columns]
    
    # Detect numeric and categorical columns
    numeric_cols = data.select_dtypes(include=['number']).columns.tolist()
    categorical_cols = [col for col in data.columns if col not in numeric_cols 
                        and not pd.api.types.is_datetime64_dtype(data[col])]
    
    # Detect date columns
    date_cols = [col for col in data.columns if pd.api.types.is_datetime64_dtype(data[col])]
    
    # Extract a title from the query (simplistic approach)
    title = query_text.strip().capitalize()
    if title.endswith('?'):
        title = title[:-1]
    
    # Helper function to get appropriate axes based on data
    def get_xy_columns():
        x_col = None
        y_col = None
        
        # First look for date columns for x-axis
        if date_cols:
            x_col = date_cols[0]
            
            # Find a numeric column for y-axis
            if numeric_cols:
                y_col = numeric_cols[0]
            # If no numeric column, use a categorical one
            elif categorical_cols:
                y_col = categorical_cols[0]
        
        # If no date column, use categorical for x and numeric for y
        elif categorical_cols and numeric_cols:
            x_col = categorical_cols[0]
            y_col = numeric_cols[0]
        
        # Two numeric columns
        elif len(numeric_cols) >= 2:
            x_col = numeric_cols[0]
            y_col = numeric_cols[1]
        
        # Two categorical columns
        elif len(categorical_cols) >= 2:
            x_col = categorical_cols[0]
            y_col = categorical_cols[1]
        
        # Only one column available
        elif len(data.columns) > 0:
            x_col = data.columns[0]
            y_col = data.columns[0] if len(data.columns) == 1 else data.columns[1]
        
        return x_col, y_col
    
    # Generate different types of visualizations
    try:
        x_col, y_col = get_xy_columns()
        
        if viz_type == "Bar Chart":
            if x_col and y_col:
                if x_col in numeric_cols and y_col in numeric_cols:
                    # Both columns are numeric, create a histogram
                    fig = px.histogram(data, x=x_col, title=title)
                else:
                    # Create a bar chart
                    fig = px.bar(data, x=x_col, y=y_col, title=title)
                    
                    # If there are multiple records per x value, use aggregation
                    if len(data) > data[x_col].nunique() and y_col in numeric_cols:
                        agg_func = 'sum'  # Default aggregation
                        if 'avg' in query_text.lower() or 'average' in query_text.lower() or 'mean' in query_text.lower():
                            agg_func = 'mean'
                        elif 'max' in query_text.lower():
                            agg_func = 'max'
                        elif 'min' in query_text.lower():
                            agg_func = 'min'
                        
                        agg_data = data.groupby(x_col)[y_col].agg(agg_func).reset_index()
                        fig = px.bar(agg_data, x=x_col, y=y_col, title=title)
            else:
                # Create a simple count plot
                if len(data.columns) > 0:
                    count_data = data[data.columns[0]].value_counts().reset_index()
                    count_data.columns = ['category', 'count']
                    fig = px.bar(count_data, x='category', y='count', title=title)
                else:
                    fig = px.bar(title=title)
        
        elif viz_type == "Line Chart":
            if x_col and y_col:
                # If x is not a date but numeric, sort data by x
                if x_col not in date_cols and x_col in numeric_cols:
                    data = data.sort_values(by=x_col)
                
                # Create line chart
                fig = px.line(data, x=x_col, y=y_col, title=title)
                
                # If there are multiple records per x value, use aggregation
                if len(data) > data[x_col].nunique() and y_col in numeric_cols:
                    agg_func = 'sum'  # Default aggregation
                    if 'avg' in query_text.lower() or 'average' in query_text.lower() or 'mean' in query_text.lower():
                        agg_func = 'mean'
                    
                    agg_data = data.groupby(x_col)[y_col].agg(agg_func).reset_index()
                    fig = px.line(agg_data, x=x_col, y=y_col, title=title)
            else:
                fig = px.line(title=f"{title} - Insufficient data for line chart")
        
        elif viz_type == "Pie Chart":
            if len(categorical_cols) >= 1 and len(numeric_cols) >= 1:
                # Use the first categorical column for names and first numeric for values
                fig = px.pie(data, names=categorical_cols[0], values=numeric_cols[0], title=title)
            elif len(categorical_cols) >= 1:
                # Count occurrences of each category
                count_data = data[categorical_cols[0]].value_counts().reset_index()
                count_data.columns = ['category', 'count']
                fig = px.pie(count_data, names='category', values='count', title=title)
            else:
                fig = px.pie(title=f"{title} - Insufficient data for pie chart")
        
        elif viz_type == "Scatter Plot":
            if len(numeric_cols) >= 2:
                # Use first two numeric columns
                x_col = numeric_cols[0]
                y_col = numeric_cols[1]
                
                # Add color by categorical column if available
                if categorical_cols:
                    color_col = categorical_cols[0]
                    fig = px.scatter(data, x=x_col, y=y_col, color=color_col, title=title)
                else:
                    fig = px.scatter(data, x=x_col, y=y_col, title=title)
            else:
                fig = px.scatter(title=f"{title} - Insufficient numeric data for scatter plot")
        
        elif viz_type == "Histogram":
            if numeric_cols:
                # Use the first numeric column
                fig = px.histogram(data, x=numeric_cols[0], title=title)
                
                # Add a rug plot
                fig.update_traces(marker_line_width=1, marker_line_color="white")
                
                # Add KDE if there are enough data points
                if len(data) > 10:
                    fig.update_layout(barmode='overlay')
                    kde_fig = px.density(data, x=numeric_cols[0], title=title)
                    # Overlay the KDE
                    for trace in kde_fig.data:
                        trace.line.color = "red"
                        fig.add_trace(trace)
            else:
                fig = px.histogram(title=f"{title} - No numeric data available for histogram")
        
        elif viz_type == "Box Plot":
            if numeric_cols:
                # Use the first numeric column
                y_col = numeric_cols[0]
                
                # Group by categorical column if available
                if categorical_cols:
                    x_col = categorical_cols[0]
                    fig = px.box(data, x=x_col, y=y_col, title=title)
                else:
                    fig = px.box(data, y=y_col, title=title)
            else:
                fig = px.box(title=f"{title} - No numeric data available for box plot")
        
        elif viz_type == "Bubble Chart":
            if len(numeric_cols) >= 3:
                # Need at least 3 numeric columns for x, y, and size
                x_col = numeric_cols[0]
                y_col = numeric_cols[1]
                size_col = numeric_cols[2]
                
                # Add color by categorical column if available
                if categorical_cols:
                    color_col = categorical_cols[0]
                    fig = px.scatter(data, x=x_col, y=y_col, size=size_col, color=color_col, title=title)
                else:
                    fig = px.scatter(data, x=x_col, y=y_col, size=size_col, title=title)
            else:
                fig = px.scatter(title=f"{title} - Insufficient numeric data for bubble chart")
        
        elif viz_type == "Heatmap":
            if len(categorical_cols) >= 2 and len(numeric_cols) >= 1:
                # Pivot the data for the heatmap
                x_col = categorical_cols[0]
                y_col = categorical_cols[1]
                value_col = numeric_cols[0]
                
                # Create pivot table
                pivot_data = data.pivot_table(index=y_col, columns=x_col, values=value_col, aggfunc='mean')
                
                # Create heatmap
                fig = px.imshow(
                    pivot_data, 
                    title=title,
                    labels=dict(x=x_col, y=y_col, color=value_col),
                    color_continuous_scale='viridis'
                )
            elif len(numeric_cols) >= 3:
                # Create correlation heatmap with numeric columns
                corr_data = data[numeric_cols].corr()
                fig = px.imshow(
                    corr_data,
                    title=f"{title} - Correlation Matrix",
                    color_continuous_scale='viridis'
                )
            else:
                fig = px.imshow(title=f"{title} - Insufficient data for heatmap")
        
        elif viz_type == "Area Chart":
            if x_col and y_col:
                # If x is not a date but numeric, sort data by x
                if x_col not in date_cols and x_col in numeric_cols:
                    data = data.sort_values(by=x_col)
                
                # Create area chart
                fig = px.area(data, x=x_col, y=y_col, title=title)
                
                # If there are multiple records per x value, use aggregation
                if len(data) > data[x_col].nunique() and y_col in numeric_cols:
                    agg_data = data.groupby(x_col)[y_col].sum().reset_index()
                    fig = px.area(agg_data, x=x_col, y=y_col, title=title)
            else:
                fig = px.area(title=f"{title} - Insufficient data for area chart")
        
        elif viz_type == "Treemap":
            if categorical_cols and numeric_cols:
                # Create path list for treemap, using all categorical columns
                path = categorical_cols[:3]  # Limit to 3 levels for readability
                
                # Use the first numeric column for values
                values = numeric_cols[0]
                
                fig = px.treemap(
                    data, 
                    path=path,
                    values=values,
                    title=title
                )
            else:
                fig = px.treemap(title=f"{title} - Insufficient data for treemap")
        
        elif viz_type == "Table":
            # Create table visualization
            fig = go.Figure(data=[go.Table(
                header=dict(
                    values=list(data.columns),
                    fill_color='paleturquoise',
                    align='left'
                ),
                cells=dict(
                    values=[data[col] for col in data.columns],
                    fill_color='lavender',
                    align='left'
                )
            )])
            fig.update_layout(title=title)
        
        else:
            # Default to a bar chart
            if x_col and y_col:
                fig = px.bar(data, x=x_col, y=y_col, title=title)
            else:
                fig = px.bar(title=f"{title} - Insufficient data for visualization")
        
        # Update layout with improved aesthetics
        fig.update_layout(
            template="plotly_white",
            title={
                'y': 0.95,
                'x': 0.5,
                'xanchor': 'center',
                'yanchor': 'top'
            },
            margin=dict(t=100, l=50, r=50, b=50)
        )
        
        return fig
    
    except Exception as e:
        # Create an error visualization
        fig = go.Figure()
        fig.add_annotation(
            text=f"Error creating {viz_type}: {str(e)}",
            showarrow=False,
            font=dict(size=16)
        )
        return fig

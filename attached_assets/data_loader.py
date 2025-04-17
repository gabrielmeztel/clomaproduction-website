import pandas as pd
import streamlit as st
import io
import numpy as np

def supported_file_types():
    """Returns a list of supported file types for data upload."""
    return ["csv", "xlsx", "xls"]

def load_data(uploaded_file):
    """
    Loads data from an uploaded file into a pandas DataFrame.
    
    Args:
        uploaded_file: The file uploaded through Streamlit's file_uploader
        
    Returns:
        DataFrame: Pandas DataFrame containing the loaded data
    """
    try:
        file_type = uploaded_file.name.split('.')[-1].lower()
        
        if file_type == 'csv':
            # Try to infer the separator automatically
            data = pd.read_csv(uploaded_file, sep=None, engine='python')
        elif file_type in ['xlsx', 'xls']:
            data = pd.read_excel(uploaded_file)
        else:
            st.error(f"Unsupported file type: {file_type}")
            return None
        
        # Basic data cleaning
        data = clean_data(data)
        
        return data
    
    except Exception as e:
        st.error(f"Error loading data: {str(e)}")
        return None

def clean_data(data):
    """
    Performs basic cleaning operations on the loaded data.
    
    Args:
        data: Pandas DataFrame to clean
        
    Returns:
        DataFrame: Cleaned DataFrame
    """
    # Remove completely empty columns
    data = data.dropna(axis=1, how='all')
    
    # Remove completely empty rows
    data = data.dropna(axis=0, how='all')
    
    # Clean column names - convert to lowercase, replace spaces with underscores
    data.columns = [str(col).strip().lower().replace(' ', '_') for col in data.columns]
    
    # Try to convert object columns to the appropriate data types
    for col in data.select_dtypes(include=['object']).columns:
        try:
            # Try to convert to numeric
            numeric_data = pd.to_numeric(data[col], errors='coerce')
            if numeric_data.notna().all():
                data[col] = numeric_data
                continue
                
            # Try to convert to datetime
            datetime_data = pd.to_datetime(data[col], errors='coerce')
            if datetime_data.notna().all():
                data[col] = datetime_data
        except:
            pass
    
    return data

def infer_data_types(data):
    """
    Infers and returns information about the data types in the DataFrame.
    
    Args:
        data: Pandas DataFrame
        
    Returns:
        dict: Dictionary with column types (numeric, categorical, datetime)
    """
    if data is None:
        return {}
    
    column_types = {
        'numeric': [],
        'categorical': [],
        'datetime': [],
        'text': []
    }
    
    for col in data.columns:
        if pd.api.types.is_numeric_dtype(data[col]):
            column_types['numeric'].append(col)
        elif pd.api.types.is_datetime64_dtype(data[col]):
            column_types['datetime'].append(col)
        elif data[col].nunique() < min(20, len(data) * 0.5):  # Heuristic for categorical
            column_types['categorical'].append(col)
        else:
            column_types['text'].append(col)
    
    return column_types

def get_sample_data_summary(data):
    """
    Returns a summary of the data for display purposes.
    
    Args:
        data: Pandas DataFrame
        
    Returns:
        dict: Dictionary with data summary
    """
    if data is None:
        return {}
    
    return {
        'rows': len(data),
        'columns': len(data.columns),
        'memory_usage': f"{data.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB",
        'column_types': infer_data_types(data)
    }

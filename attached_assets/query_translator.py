import pandas as pd
import re
import nltk
import os
import string
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sqlalchemy import text

# Download necessary NLTK data (only first time)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

def translate_to_sql(query, data):
    """
    Translates a natural language query to a SQL query based on the DataFrame schema.
    
    Args:
        query (str): Natural language query
        data (DataFrame): Pandas DataFrame with the data
        
    Returns:
        tuple: (sql_query, explanation) - The translated SQL query and an explanation
    """
    # Clean and normalize the query
    clean_query = clean_text(query)
    keywords = extract_keywords(clean_query, data)
    
    # Identify query type and construct SQL
    query_type = determine_query_type(clean_query)
    
    # Construct SQL based on query type and keywords
    if query_type == 'aggregate':
        sql_query, explanation = construct_aggregate_query(keywords, data)
    elif query_type == 'filter':
        sql_query, explanation = construct_filter_query(keywords, data)
    elif query_type == 'comparison':
        sql_query, explanation = construct_comparison_query(keywords, data)
    elif query_type == 'trend':
        sql_query, explanation = construct_trend_query(keywords, data)
    else:
        # Default to a simple select query
        sql_query = f"SELECT * FROM data LIMIT 100"
        explanation = "Generated a default query to show sample data."
    
    return sql_query, explanation

def clean_text(text):
    """Cleans and normalizes the input text."""
    # Convert to lowercase
    text = text.lower()
    
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text

def extract_keywords(text, data):
    """
    Extracts relevant keywords from the query text based on data columns.
    
    Args:
        text (str): Cleaned query text
        data (DataFrame): Pandas DataFrame
        
    Returns:
        dict: Dictionary with extracted keywords by category
    """
    # Tokenize the text
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [word for word in tokens if word not in stop_words]
    
    # Initialize keywords dictionary
    keywords = {
        'columns': [],
        'aggregate_functions': [],
        'filters': [],
        'sort': None,
        'limit': None,
        'time_related': False
    }
    
    # Get column names from data
    column_names = [col.lower() for col in data.columns]
    
    # Aggregate functions to look for
    agg_functions = ['sum', 'count', 'average', 'avg', 'mean', 'max', 'min', 'total']
    
    # Filter terms
    filter_terms = ['where', 'filter', 'only', 'exclude', 'include', 'greater', 'less', 'than', 'equal']
    
    # Sort terms
    sort_terms = ['sort', 'order', 'arrange', 'ranking', 'rank', 'top', 'bottom', 'highest', 'lowest']
    
    # Time-related terms
    time_terms = ['year', 'month', 'day', 'date', 'time', 'period', 'quarter', 'weekly', 'daily', 'monthly', 'yearly', 'trend', 'over time']
    
    # Check for column names in the query
    for token in filtered_tokens:
        if token in column_names:
            keywords['columns'].append(token)
        
        # Check for close matches to column names
        else:
            for col in column_names:
                # Check if token is a substring of a column name or vice versa
                if token in col or col in token:
                    if len(token) >= 3 and len(col) >= 3:  # Avoid very short matches
                        keywords['columns'].append(col)
    
    # Look for aggregate functions
    for token in filtered_tokens:
        if token in agg_functions:
            keywords['aggregate_functions'].append(token)
    
    # Check for time-related queries
    for term in time_terms:
        if term in text:
            keywords['time_related'] = True
            break
    
    # Check for filter conditions
    filter_found = False
    for i, token in enumerate(filtered_tokens):
        if token in filter_terms:
            filter_found = True
        
        if filter_found and i < len(filtered_tokens) - 2:
            # Simple pattern matching for filter conditions
            # Example: "sales greater than 1000"
            if token in column_names and i + 2 < len(filtered_tokens):
                if filtered_tokens[i+1] in ['greater', 'more', 'higher', 'above', 'over']:
                    keywords['filters'].append({
                        'column': token,
                        'operator': '>',
                        'value': filtered_tokens[i+2]
                    })
                elif filtered_tokens[i+1] in ['less', 'lower', 'below', 'under']:
                    keywords['filters'].append({
                        'column': token,
                        'operator': '<',
                        'value': filtered_tokens[i+2]
                    })
                elif filtered_tokens[i+1] in ['equal', 'equals', 'is']:
                    keywords['filters'].append({
                        'column': token,
                        'operator': '=',
                        'value': filtered_tokens[i+2]
                    })
    
    # Check for sorting
    for token in filtered_tokens:
        if token in sort_terms:
            keywords['sort'] = 'desc' if token in ['top', 'highest'] else 'asc'
    
    # Look for limit values (e.g., "top 5", "first 10")
    limit_pattern = r'(?:top|bottom|first|last|limit)\s+(\d+)'
    limit_match = re.search(limit_pattern, text)
    if limit_match:
        keywords['limit'] = int(limit_match.group(1))
    
    return keywords

def determine_query_type(query):
    """
    Determines the type of query based on the natural language question.
    
    Args:
        query (str): The natural language query
        
    Returns:
        str: The query type (aggregate, filter, comparison, trend)
    """
    # Check for aggregation patterns
    agg_patterns = ['total', 'sum', 'average', 'count', 'how many', 'mean']
    for pattern in agg_patterns:
        if pattern in query:
            return 'aggregate'
    
    # Check for filtering patterns
    filter_patterns = ['where', 'filter', 'only', 'show me', 'find']
    for pattern in filter_patterns:
        if pattern in query:
            return 'filter'
    
    # Check for comparison patterns
    comparison_patterns = ['compare', 'versus', 'vs', 'difference', 'compared to']
    for pattern in comparison_patterns:
        if pattern in query:
            return 'comparison'
    
    # Check for trend patterns
    trend_patterns = ['trend', 'over time', 'by month', 'by year', 'by day', 'monthly', 'yearly']
    for pattern in trend_patterns:
        if pattern in query:
            return 'trend'
    
    # Default to aggregate if no specific type is determined
    return 'aggregate'

def construct_aggregate_query(keywords, data):
    """
    Constructs an aggregation SQL query based on extracted keywords.
    
    Args:
        keywords (dict): Dictionary with extracted keywords
        data (DataFrame): Pandas DataFrame
        
    Returns:
        tuple: (sql_query, explanation)
    """
    # Default selections
    select_clause = []
    group_by_clause = []
    order_by_clause = ""
    limit_clause = ""
    explanation = "This query "
    
    # Determine columns to use
    if keywords['columns']:
        # Identify potential group by columns and aggregate columns
        numeric_cols = data.select_dtypes(include=['number']).columns.tolist()
        numeric_cols = [col for col in numeric_cols if col.lower() in [c.lower() for c in keywords['columns']]]
        
        categorical_cols = [col for col in keywords['columns'] if col.lower() not in [c.lower() for c in numeric_cols]]
        
        # If we have identified categorical columns, use them for grouping
        if categorical_cols:
            for col in categorical_cols:
                column_name = next((c for c in data.columns if c.lower() == col.lower()), col)
                select_clause.append(f'"{column_name}"')
                group_by_clause.append(f'"{column_name}"')
            
            explanation += f"groups data by {', '.join(categorical_cols)}"
        
        # Apply aggregate functions to numeric columns
        if numeric_cols and keywords['aggregate_functions']:
            for col in numeric_cols:
                column_name = next((c for c in data.columns if c.lower() == col.lower()), col)
                
                # Use the first aggregate function mentioned, default to SUM
                agg_func = keywords['aggregate_functions'][0] if keywords['aggregate_functions'] else 'SUM'
                
                # Map common language terms to SQL functions
                if agg_func in ['average', 'avg', 'mean']:
                    agg_func = 'AVG'
                elif agg_func in ['total', 'sum']:
                    agg_func = 'SUM'
                else:
                    agg_func = agg_func.upper()
                
                select_clause.append(f'{agg_func}("{column_name}") as {agg_func.lower()}_{column_name}')
                
                if explanation != "This query ":
                    explanation += f" and calculates the {agg_func.lower()} of {column_name}"
                else:
                    explanation += f"calculates the {agg_func.lower()} of {column_name}"
        
        # If no aggregate functions were specified but we have numeric columns, 
        # use sum as default aggregate
        elif numeric_cols:
            for col in numeric_cols:
                column_name = next((c for c in data.columns if c.lower() == col.lower()), col)
                select_clause.append(f'SUM("{column_name}") as sum_{column_name}')
                
                if explanation != "This query ":
                    explanation += f" and calculates the sum of {column_name}"
                else:
                    explanation += f"calculates the sum of {column_name}"
    
    # If no columns were identified, use defaults
    if not select_clause:
        # Try to find a numeric column for aggregation
        numeric_cols = data.select_dtypes(include=['number']).columns.tolist()
        if numeric_cols:
            select_clause.append(f'SUM("{numeric_cols[0]}") as sum_{numeric_cols[0]}')
            explanation = f"This query calculates the sum of {numeric_cols[0]}"
            
            # Find a potential grouping column (categorical with low cardinality)
            for col in data.columns:
                if col not in numeric_cols and data[col].nunique() < min(20, len(data) * 0.1):
                    select_clause.insert(0, f'"{col}"')
                    group_by_clause.append(f'"{col}"')
                    explanation = f"This query groups data by {col} and calculates the sum of {numeric_cols[0]}"
                    break
        else:
            # Just count rows if no numeric columns
            select_clause.append('COUNT(*) as row_count')
            explanation = "This query counts the number of rows"
    
    # Handle sorting
    if keywords['sort']:
        # By default, sort by the first aggregate in descending order
        agg_cols = [c for c in select_clause if 'sum_' in c or 'avg_' in c or 'count_' in c or 'min_' in c or 'max_' in c]
        if agg_cols:
            order_dir = "DESC" if keywords['sort'] == 'desc' else "ASC"
            order_by_clause = f"ORDER BY {agg_cols[0]} {order_dir}"
            
            explanation += f" and sorts results {order_dir.lower()}"
    
    # Handle limits
    if keywords['limit']:
        limit_clause = f"LIMIT {keywords['limit']}"
        explanation += f" with a limit of {keywords['limit']} rows"
    
    # Construct the complete SQL query
    select_sql = ", ".join(select_clause)
    group_by_sql = f"GROUP BY {', '.join(group_by_clause)}" if group_by_clause else ""
    
    sql_query = f"SELECT {select_sql} FROM data {group_by_sql} {order_by_clause} {limit_clause}"
    
    return sql_query, explanation + "."

def construct_filter_query(keywords, data):
    """
    Constructs a filtering SQL query based on extracted keywords.
    
    Args:
        keywords (dict): Dictionary with extracted keywords
        data (DataFrame): Pandas DataFrame
        
    Returns:
        tuple: (sql_query, explanation)
    """
    # Default selections
    select_clause = []
    where_clause = []
    order_by_clause = ""
    limit_clause = ""
    explanation = "This query filters the data "
    
    # Add columns to select
    if keywords['columns']:
        for col in keywords['columns']:
            column_name = next((c for c in data.columns if c.lower() == col.lower()), col)
            select_clause.append(f'"{column_name}"')
    else:
        # If no columns specified, select everything
        select_clause.append("*")
    
    # Add filter conditions
    if keywords['filters']:
        for filter_cond in keywords['filters']:
            col = filter_cond['column']
            operator = filter_cond['operator']
            value = filter_cond['value']
            
            # Try to find the actual column name
            column_name = next((c for c in data.columns if c.lower() == col.lower()), col)
            
            # Try to convert value to numeric if column is numeric
            if column_name in data.columns and pd.api.types.is_numeric_dtype(data[column_name]):
                try:
                    value = float(value)
                    where_clause.append(f'"{column_name}" {operator} {value}')
                except ValueError:
                    where_clause.append(f'"{column_name}" {operator} "{value}"')
            else:
                where_clause.append(f'"{column_name}" {operator} "{value}"')
            
            op_text = {"=": "equals", ">": "greater than", "<": "less than"}.get(operator, operator)
            explanation += f"where {column_name} is {op_text} {value}"
    
    # Handle sorting
    if keywords['sort']:
        sort_col = keywords['columns'][0] if keywords['columns'] else data.columns[0]
        column_name = next((c for c in data.columns if c.lower() == sort_col.lower()), sort_col)
        
        order_dir = "DESC" if keywords['sort'] == 'desc' else "ASC"
        order_by_clause = f'ORDER BY "{column_name}" {order_dir}'
        
        explanation += f" and sorts by {column_name} {order_dir.lower()}"
    
    # Handle limits
    if keywords['limit']:
        limit_clause = f"LIMIT {keywords['limit']}"
        explanation += f" with a limit of {keywords['limit']} rows"
    
    # Construct the complete SQL query
    select_sql = ", ".join(select_clause)
    where_sql = f"WHERE {' AND '.join(where_clause)}" if where_clause else ""
    
    sql_query = f"SELECT {select_sql} FROM data {where_sql} {order_by_clause} {limit_clause}"
    
    return sql_query, explanation + "."

def construct_comparison_query(keywords, data):
    """
    Constructs a comparison SQL query based on extracted keywords.
    
    Args:
        keywords (dict): Dictionary with extracted keywords
        data (DataFrame): Pandas DataFrame
        
    Returns:
        tuple: (sql_query, explanation)
    """
    # This is a simplified implementation for comparison queries
    # For a real-world implementation, more complex logic would be needed
    
    select_clause = []
    group_by_clause = []
    explanation = "This query compares "
    
    # Try to identify the columns to compare
    if keywords['columns']:
        if len(keywords['columns']) >= 2:
            # We have at least two columns to compare
            compare_cols = keywords['columns'][:2]
            metric_col = None
            
            # Try to find a numeric column for comparison if not in the identified columns
            numeric_cols = data.select_dtypes(include=['number']).columns.tolist()
            if numeric_cols:
                for col in numeric_cols:
                    if col.lower() not in [c.lower() for c in compare_cols]:
                        metric_col = col
                        break
            
            # If we found a metric column, compare the two columns based on this metric
            if metric_col:
                # Format column names
                col1 = next((c for c in data.columns if c.lower() == compare_cols[0].lower()), compare_cols[0])
                col2 = next((c for c in data.columns if c.lower() == compare_cols[1].lower()), compare_cols[1])
                
                select_clause.append(f'"{col1}"')
                select_clause.append(f'"{col2}"')
                select_clause.append(f'SUM("{metric_col}") as {metric_col}_total')
                
                group_by_clause.append(f'"{col1}"')
                group_by_clause.append(f'"{col2}"')
                
                explanation += f"{col1} and {col2} based on total {metric_col}"
            else:
                # No metric column found, just compare the distribution of the two columns
                col1 = next((c for c in data.columns if c.lower() == compare_cols[0].lower()), compare_cols[0])
                col2 = next((c for c in data.columns if c.lower() == compare_cols[1].lower()), compare_cols[1])
                
                select_clause.append(f'"{col1}"')
                select_clause.append(f'COUNT(*) as count')
                group_by_clause.append(f'"{col1}"')
                
                explanation += f"the distribution of {col1} values"
        else:
            # Just one column to analyze
            col = keywords['columns'][0]
            column_name = next((c for c in data.columns if c.lower() == col.lower()), col)
            
            select_clause.append(f'"{column_name}"')
            select_clause.append('COUNT(*) as count')
            group_by_clause.append(f'"{column_name}"')
            
            explanation += f"the distribution of {column_name} values"
    else:
        # No specific columns identified, try to find categorical and numeric columns
        categorical_cols = []
        numeric_cols = data.select_dtypes(include=['number']).columns.tolist()
        
        for col in data.columns:
            if col not in numeric_cols and data[col].nunique() < min(20, len(data) * 0.1):
                categorical_cols.append(col)
        
        if categorical_cols and numeric_cols:
            # Compare one categorical column based on a numeric metric
            cat_col = categorical_cols[0]
            num_col = numeric_cols[0]
            
            select_clause.append(f'"{cat_col}"')
            select_clause.append(f'SUM("{num_col}") as {num_col}_total')
            group_by_clause.append(f'"{cat_col}"')
            
            explanation += f"different {cat_col} values based on total {num_col}"
        elif categorical_cols:
            # Just analyze the distribution of a categorical column
            cat_col = categorical_cols[0]
            
            select_clause.append(f'"{cat_col}"')
            select_clause.append('COUNT(*) as count')
            group_by_clause.append(f'"{cat_col}"')
            
            explanation += f"the distribution of {cat_col} values"
        else:
            # Fallback to a simple aggregation
            select_clause.append('*')
            explanation = "This query shows a sample of the data"
    
    # Construct the complete SQL query
    select_sql = ", ".join(select_clause)
    group_by_sql = f"GROUP BY {', '.join(group_by_clause)}" if group_by_clause else ""
    order_by_clause = "ORDER BY 2 DESC" if len(select_clause) > 1 and "count" in select_clause[1] else ""
    limit_clause = "LIMIT 10"  # Default limit for comparison queries
    
    sql_query = f"SELECT {select_sql} FROM data {group_by_sql} {order_by_clause} {limit_clause}"
    
    return sql_query, explanation + "."

def construct_trend_query(keywords, data):
    """
    Constructs a trend analysis SQL query based on extracted keywords.
    
    Args:
        keywords (dict): Dictionary with extracted keywords
        data (DataFrame): Pandas DataFrame
        
    Returns:
        tuple: (sql_query, explanation)
    """
    # Look for datetime columns
    datetime_cols = []
    for col in data.columns:
        if pd.api.types.is_datetime64_dtype(data[col]):
            datetime_cols.append(col)
    
    # If no datetime columns found, look for columns with date-like names
    if not datetime_cols:
        date_pattern = re.compile(r'date|time|year|month|day', re.IGNORECASE)
        for col in data.columns:
            if date_pattern.search(col):
                datetime_cols.append(col)
    
    # If still no datetime columns, use the first column
    if not datetime_cols and len(data.columns) > 0:
        datetime_cols.append(data.columns[0])
    
    # Select a datetime column to use for trends
    time_col = datetime_cols[0] if datetime_cols else None
    
    # Find numeric columns for metrics
    numeric_cols = data.select_dtypes(include=['number']).columns.tolist()
    metric_col = None
    
    # Try to find the metric column from keywords
    if keywords['columns']:
        for col in keywords['columns']:
            col_match = next((c for c in numeric_cols if c.lower() == col.lower()), None)
            if col_match:
                metric_col = col_match
                break
    
    # If no metric column found from keywords, use the first numeric column
    if not metric_col and numeric_cols:
        metric_col = numeric_cols[0]
    
    # Construct the query
    select_clause = []
    group_by_clause = []
    order_by_clause = ""
    explanation = "This query analyzes trends "
    
    if time_col and metric_col:
        # Format time column based on data granularity
        # This is a simplified approach - a more sophisticated implementation
        # would analyze the data to determine appropriate time grouping
        
        if 'month' in time_col.lower() or 'monthly' in keywords['query']:
            select_clause.append(f'DATE_TRUNC("month", "{time_col}") as month')
            group_by_clause.append('month')
            order_by_clause = "ORDER BY month"
            explanation += f"of {metric_col} by month"
        elif 'year' in time_col.lower() or 'yearly' in keywords['query']:
            select_clause.append(f'DATE_TRUNC("year", "{time_col}") as year')
            group_by_clause.append('year')
            order_by_clause = "ORDER BY year"
            explanation += f"of {metric_col} by year"
        elif 'day' in time_col.lower() or 'daily' in keywords['query']:
            select_clause.append(f'DATE_TRUNC("day", "{time_col}") as day')
            group_by_clause.append('day')
            order_by_clause = "ORDER BY day"
            explanation += f"of {metric_col} by day"
        else:
            # Default to monthly if not specified
            select_clause.append(f'DATE_TRUNC("month", "{time_col}") as month')
            group_by_clause.append('month')
            order_by_clause = "ORDER BY month"
            explanation += f"of {metric_col} by month"
        
        # Add the metric with aggregation
        agg_func = keywords['aggregate_functions'][0] if keywords['aggregate_functions'] else 'SUM'
        
        # Map common language terms to SQL functions
        if agg_func in ['average', 'avg', 'mean']:
            agg_func = 'AVG'
        elif agg_func in ['total', 'sum']:
            agg_func = 'SUM'
        else:
            agg_func = agg_func.upper()
        
        select_clause.append(f'{agg_func}("{metric_col}") as {agg_func.lower()}_{metric_col}')
        explanation += f" using {agg_func.lower()}"
    else:
        # Fallback to a simple query if we couldn't identify time or metric columns
        select_clause.append('*')
        explanation = "This query shows a sample of the data since no time or metric columns were identified"
    
    # Construct the complete SQL query
    select_sql = ", ".join(select_clause)
    group_by_sql = f"GROUP BY {', '.join(group_by_clause)}" if group_by_clause else ""
    limit_clause = "LIMIT 100"  # Default limit
    
    sql_query = f"SELECT {select_sql} FROM data {group_by_sql} {order_by_clause} {limit_clause}"
    
    return sql_query, explanation + "."

def execute_sql_query(sql_query, data):
    """
    Executes a SQL query on a pandas DataFrame.
    
    Args:
        sql_query (str): SQL query to execute
        data (DataFrame): Pandas DataFrame
        
    Returns:
        DataFrame: Result of the query
    """
    try:
        # Create a copy of data with table name 'data'
        from pandasql import sqldf
        
        # Define the sqldf function with the appropriate namespace
        def run_query(q):
            return sqldf(q, {"data": data})
        
        # Execute the query
        result = run_query(sql_query)
        return result
    
    except Exception as e:
        # Fallback to basic filtering if SQL execution fails
        import re
        
        # Very basic parsing for simple WHERE conditions
        where_match = re.search(r'WHERE\s+(.+?)(?:ORDER BY|GROUP BY|LIMIT|$)', sql_query, re.IGNORECASE)
        if where_match:
            where_condition = where_match.group(1).strip()
            
            # Parse simple equality conditions
            condition_pattern = r'\"(.+?)\"\s*(=|>|<)\s*\"?(.+?)\"?(?:\s+AND|\s+OR|$)'
            conditions = re.findall(condition_pattern, where_condition)
            
            filtered_data = data.copy()
            for col, op, val in conditions:
                try:
                    # Try to convert val to appropriate type
                    if val.isdigit():
                        val = int(val)
                    elif val.replace('.', '', 1).isdigit():
                        val = float(val)
                        
                    if op == '=':
                        filtered_data = filtered_data[filtered_data[col] == val]
                    elif op == '>':
                        filtered_data = filtered_data[filtered_data[col] > val]
                    elif op == '<':
                        filtered_data = filtered_data[filtered_data[col] < val]
                except:
                    pass
            
            return filtered_data.head(100)
        
        # If we can't parse WHERE conditions, just return the original data
        return data.head(100)

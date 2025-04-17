import os
import json
import uuid
import datetime
import pandas as pd
from sqlalchemy import create_engine, Column, String, DateTime, Text, Integer, MetaData, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import streamlit as st

# Create Base class for SQLAlchemy models
Base = declarative_base()

def setup_database():
    """
    Sets up a database connection and creates necessary tables.
    
    Returns:
        Engine: SQLAlchemy engine object
    """
    try:
        # Try to use an external PostgreSQL database if credentials are provided
        if os.getenv('DATABASE_URL'):
            db_url = os.getenv('DATABASE_URL')
            engine = create_engine(db_url)
        elif all([os.getenv(var) for var in ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD']]):
            db_url = f"postgresql://{os.getenv('PGUSER')}:{os.getenv('PGPASSWORD')}@{os.getenv('PGHOST')}:{os.getenv('PGPORT', '5432')}/{os.getenv('PGDATABASE')}"
            engine = create_engine(db_url)
        else:
            # Fallback to SQLite in-memory database
            engine = create_engine('sqlite:///:memory:')
        
        # Create tables
        metadata = MetaData()
        
        # Visualizations table
        visualizations = Table(
            'visualizations', 
            metadata,
            Column('id', String(50), primary_key=True),
            Column('name', String(200)),
            Column('created_at', DateTime),
            Column('query', Text),
            Column('sql', Text),
            Column('viz_type', String(50)),
            Column('views', Integer, default=0),
            Column('data', Text)  # Stores the visualization JSON data
        )
        
        # Create the tables
        metadata.create_all(engine)
        
        return engine
    
    except Exception as e:
        st.error(f"Database setup error: {str(e)}")
        # Fallback to using in-memory storage via session state
        if 'visualizations' not in st.session_state:
            st.session_state.visualizations = {}
        return None

def save_visualization(db_engine, viz_id, query, sql, viz_type, viz_data):
    """
    Saves a visualization to the database.
    
    Args:
        db_engine: SQLAlchemy engine or None for session state storage
        viz_id (str): Unique ID for the visualization
        query (str): Original natural language query
        sql (str): The SQL query
        viz_type (str): Type of visualization
        viz_data (str): JSON string of visualization data
        
    Returns:
        str: Visualization ID
    """
    try:
        # If no database engine, use session state storage
        if db_engine is None:
            # Generate a random ID if not provided
            if not viz_id:
                viz_id = str(uuid.uuid4())
            
            # Store in session state
            st.session_state.visualizations[viz_id] = {
                'id': viz_id,
                'name': f"Visualization {len(st.session_state.visualizations) + 1}",
                'created_at': datetime.datetime.now().isoformat(),
                'query': query,
                'sql': sql,
                'viz_type': viz_type,
                'views': 0,
                'data': viz_data
            }
            
            return viz_id
        
        # Use database for storage
        try:
            # Connect to the database
            conn = db_engine.connect()
            
            # Generate a random ID if not provided
            if not viz_id:
                viz_id = str(uuid.uuid4())
            
            # Check if visualization already exists
            result = conn.execute(
                "SELECT id FROM visualizations WHERE id = %s", 
                (viz_id,)
            ).fetchone()
            
            if result:
                # Update existing visualization
                conn.execute(
                    """
                    UPDATE visualizations 
                    SET query = %s, sql = %s, viz_type = %s, data = %s 
                    WHERE id = %s
                    """,
                    (query, sql, viz_type, viz_data, viz_id)
                )
            else:
                # Insert new visualization
                conn.execute(
                    """
                    INSERT INTO visualizations 
                    (id, name, created_at, query, sql, viz_type, views, data) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        viz_id,
                        f"Visualization {viz_id[:8]}",
                        datetime.datetime.now(),
                        query,
                        sql,
                        viz_type,
                        0,
                        viz_data
                    )
                )
            
            conn.close()
            return viz_id
        
        except Exception as e:
            # If database operation fails, fallback to session state
            if 'visualizations' not in st.session_state:
                st.session_state.visualizations = {}
            
            # Generate a random ID if not provided
            if not viz_id:
                viz_id = str(uuid.uuid4())
            
            # Store in session state
            st.session_state.visualizations[viz_id] = {
                'id': viz_id,
                'name': f"Visualization {len(st.session_state.visualizations) + 1}",
                'created_at': datetime.datetime.now().isoformat(),
                'query': query,
                'sql': sql,
                'viz_type': viz_type,
                'views': 0,
                'data': viz_data
            }
            
            return viz_id
    
    except Exception as e:
        st.error(f"Error saving visualization: {str(e)}")
        return None

def get_visualization_by_id(db_engine, viz_id):
    """
    Retrieves a visualization by ID.
    
    Args:
        db_engine: SQLAlchemy engine or None for session state storage
        viz_id (str): Visualization ID
        
    Returns:
        dict: Visualization data
    """
    try:
        # Try to retrieve from session state if no database engine
        if db_engine is None:
            if viz_id in st.session_state.visualizations:
                viz = st.session_state.visualizations[viz_id]
                # Increment view count
                viz['views'] += 1
                return viz
            return None
        
        # Use database for retrieval
        try:
            # Connect to the database
            conn = db_engine.connect()
            
            # Get visualization
            result = conn.execute(
                "SELECT * FROM visualizations WHERE id = %s", 
                (viz_id,)
            ).fetchone()
            
            if result:
                # Convert SQLAlchemy Row to dict
                viz = dict(result)
                
                # Increment view count
                conn.execute(
                    "UPDATE visualizations SET views = views + 1 WHERE id = %s",
                    (viz_id,)
                )
                
                conn.close()
                return viz
            
            conn.close()
            return None
        
        except Exception as e:
            # If database operation fails, try session state
            if 'visualizations' in st.session_state and viz_id in st.session_state.visualizations:
                viz = st.session_state.visualizations[viz_id]
                # Increment view count
                viz['views'] += 1
                return viz
            return None
    
    except Exception as e:
        st.error(f"Error retrieving visualization: {str(e)}")
        return None

def get_all_visualizations(db_engine, limit=50):
    """
    Retrieves all saved visualizations.
    
    Args:
        db_engine: SQLAlchemy engine or None for session state storage
        limit (int): Maximum number of visualizations to return
        
    Returns:
        list: List of visualization data dictionaries
    """
    try:
        # Try to retrieve from session state if no database engine
        if db_engine is None:
            if 'visualizations' in st.session_state:
                # Convert to list and sort by created_at
                vizs = list(st.session_state.visualizations.values())
                vizs.sort(key=lambda x: x['created_at'], reverse=True)
                return vizs[:limit]
            return []
        
        # Use database for retrieval
        try:
            # Connect to the database
            conn = db_engine.connect()
            
            # Get visualizations
            results = conn.execute(
                f"SELECT * FROM visualizations ORDER BY created_at DESC LIMIT {limit}"
            ).fetchall()
            
            conn.close()
            
            # Convert SQLAlchemy Rows to dicts
            visualizations = [dict(row) for row in results]
            return visualizations
        
        except Exception as e:
            # If database operation fails, try session state
            if 'visualizations' in st.session_state:
                # Convert to list and sort by created_at
                vizs = list(st.session_state.visualizations.values())
                vizs.sort(key=lambda x: x['created_at'], reverse=True)
                return vizs[:limit]
            return []
    
    except Exception as e:
        st.error(f"Error retrieving visualizations: {str(e)}")
        return []

def delete_visualization(db_engine, viz_id):
    """
    Deletes a visualization by ID.
    
    Args:
        db_engine: SQLAlchemy engine or None for session state storage
        viz_id (str): Visualization ID
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Try to delete from session state if no database engine
        if db_engine is None:
            if viz_id in st.session_state.visualizations:
                del st.session_state.visualizations[viz_id]
                return True
            return False
        
        # Use database for deletion
        try:
            # Connect to the database
            conn = db_engine.connect()
            
            # Delete visualization
            conn.execute(
                "DELETE FROM visualizations WHERE id = %s", 
                (viz_id,)
            )
            
            conn.close()
            return True
        
        except Exception as e:
            # If database operation fails, try session state
            if 'visualizations' in st.session_state and viz_id in st.session_state.visualizations:
                del st.session_state.visualizations[viz_id]
                return True
            return False
    
    except Exception as e:
        st.error(f"Error deleting visualization: {str(e)}")
        return False

def get_visualization_stats(db_engine):
    """
    Gets statistics about saved visualizations.
    
    Args:
        db_engine: SQLAlchemy engine or None for session state storage
        
    Returns:
        dict: Visualization statistics
    """
    try:
        # If no database engine, use session state storage
        if db_engine is None:
            if 'visualizations' not in st.session_state:
                return {
                    'total_count': 0,
                    'total_views': 0,
                    'popular_types': {}
                }
            
            vizs = st.session_state.visualizations.values()
            
            total_count = len(vizs)
            total_views = sum(v.get('views', 0) for v in vizs)
            
            # Count by type
            type_counts = {}
            for v in vizs:
                viz_type = v.get('viz_type', 'Unknown')
                type_counts[viz_type] = type_counts.get(viz_type, 0) + 1
            
            return {
                'total_count': total_count,
                'total_views': total_views,
                'popular_types': type_counts
            }
        
        # Use database for stats
        try:
            # Connect to the database
            conn = db_engine.connect()
            
            # Get counts
            total_count = conn.execute("SELECT COUNT(*) FROM visualizations").scalar()
            total_views = conn.execute("SELECT SUM(views) FROM visualizations").scalar() or 0
            
            # Get type counts
            type_results = conn.execute(
                "SELECT viz_type, COUNT(*) as count FROM visualizations GROUP BY viz_type"
            ).fetchall()
            
            type_counts = {row[0]: row[1] for row in type_results}
            
            conn.close()
            
            return {
                'total_count': total_count,
                'total_views': total_views,
                'popular_types': type_counts
            }
        
        except Exception as e:
            # If database operation fails, fallback to session state
            if 'visualizations' not in st.session_state:
                return {
                    'total_count': 0,
                    'total_views': 0,
                    'popular_types': {}
                }
            
            vizs = st.session_state.visualizations.values()
            
            total_count = len(vizs)
            total_views = sum(v.get('views', 0) for v in vizs)
            
            # Count by type
            type_counts = {}
            for v in vizs:
                viz_type = v.get('viz_type', 'Unknown')
                type_counts[viz_type] = type_counts.get(viz_type, 0) + 1
            
            return {
                'total_count': total_count,
                'total_views': total_views,
                'popular_types': type_counts
            }
    
    except Exception as e:
        st.error(f"Error getting visualization stats: {str(e)}")
        return {
            'total_count': 0,
            'total_views': 0,
            'popular_types': {}
        }

from datetime import datetime, timedelta

def convert_date(date_str):
    current_year = datetime.now().year

    date_str = date_str.replace("updated ", "")
    # Handle "H ago" case
    if "H ago" in date_str:
        formatted_date = (datetime.now() - timedelta(hours=int(date_str.split("H")[0]))).strftime('%Y-%m-%d')
    # Handle "M ago" case
    elif "M ago" in date_str:
        minutes_ago = int(date_str.split("M")[0])
        formatted_date = (datetime.now() - timedelta(minutes=minutes_ago)).strftime('%Y-%m-%d')
    else:
        # Check if the date string matches the desired format
        try:
            parsed_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
        except ValueError:
            try:
                parsed_date = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                # Assume the year is 2024 if not provided
                if "," not in date_str:
                    date_str += f", {current_year}"
                
                # Parse and format the date
                parsed_date = datetime.strptime(date_str, '%b %d, %Y')
        
        formatted_date = parsed_date.strftime('%Y-%m-%d')

    return formatted_date
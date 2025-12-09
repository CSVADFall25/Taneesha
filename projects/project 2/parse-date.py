import xml.etree.ElementTree as ET
import pandas as pd
from pathlib import Path

# load the XML file
xml_path = Path('export.xml')
if not xml_path.exists():
    alt = Path('apple_health_export') / 'export.xml'
    if alt.exists():
        xml_path = alt
    else:
        raise FileNotFoundError(
            f"Could not find 'export.xml' in the current directory or at '{alt}'.\n"
            "Place 'export.xml' in the script folder, run the script from the folder that contains it, or"
            " put the Apple export inside the 'apple_health_export' subfolder."
        )

tree = ET.parse(str(xml_path))
root = tree.getroot()

# extract step count
records = []
for record in root.findall('Record'):
    if record.attrib.get('type') == 'HKQuantityTypeIdentifierStepCount':
        records.append({
            'startDate': record.attrib.get('startDate'),
            'endDate': record.attrib.get('endDate'),
            'value': int(record.attrib.get('value'))
        })

# convert to dataframe
df = pd.DataFrame(records)

# extract statedate
df['date'] = pd.to_datetime(df['startDate']).dt.date

# combine all steps per day
daily_steps = df.groupby('date')['value'].sum().reset_index()
daily_steps.rename(columns={'value': 'steps'}, inplace=True)

# save as CSV
daily_steps.to_csv('daily_steps.csv', index=False)

print(daily_steps.head())

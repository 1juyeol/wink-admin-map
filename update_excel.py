import base64
import os

excel_path = 'src/assets/permission_data.xlsx'
target_js_path = 'src/data/embeddedExcel.js'

if not os.path.exists(excel_path):
    print("Excel file not found!")
    exit(1)

with open(excel_path, 'rb') as f:
    data = f.read()
    b64_str = base64.b64encode(data).decode('utf-8')

js_content = f"""// AUTO-GENERATED: Updated from {excel_path}
export const EXCEL_BASE64 = "{b64_str}";
"""

with open(target_js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Updated embeddedExcel.js successfully with {len(b64_str)} bytes.")

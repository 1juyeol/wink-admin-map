
import fs from 'fs';
import path from 'path';

const excelPath = path.join(process.cwd(), 'public', 'permission_data.xlsx');
const outputPath = path.join(process.cwd(), 'src', 'data', 'embeddedExcel.js');

try {
    if (!fs.existsSync(excelPath)) {
        console.error(`Error: Excel file not found at ${excelPath}`);
        process.exit(1);
    }

    const fileBuffer = fs.readFileSync(excelPath);
    const base64String = fileBuffer.toString('base64');

    const content = `// AUTO-GENERATED: Updated from public/permission_data.xlsx
export const EXCEL_BASE64 = "${base64String}";
`;

    fs.writeFileSync(outputPath, content);
    console.log(`Successfully updated ${outputPath} from ${excelPath}`);
    console.log(`Excel size: ${fileBuffer.length} bytes`);

} catch (error) {
    console.error('Failed to update embedded excel:', error);
    process.exit(1);
}

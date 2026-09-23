import fs from 'fs';

let apiFile = fs.readFileSync('frontend/services/api.js', 'utf8');

if (!apiFile.includes('institutions: {')) {
  apiFile = apiFile.replace(
    'export const api = {',
    'export const api = {\n    institutions: {\n        getAll: async () => {\n            try {\n                const res = await apiClient.get("/institutions/");\n                return res.data || [];\n            } catch {\n                return [];\n            }\n        }\n    },'
  );
  fs.writeFileSync('frontend/services/api.js', apiFile);
  console.log('Added institutions to api.js');
} else {
  console.log('Institutions already exists in api.js');
}

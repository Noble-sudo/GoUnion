import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/admin.js', 'utf8');

const newEndpoints = `
adminRouter.post(
  '/institutions',
  asyncHandler(async (req, res) => {
    const { name, slug, location, status } = req.body;
    if (!name || !slug) throw notFound('Name and slug are required.');
    const Institution = (await import('../models.js')).Institution;
    const existing = await Institution.findOne({ slug });
    if (existing) {
        return res.status(400).json({ error: 'Campus with this slug already exists.' });
    }
    const inst = new Institution({ name, slug, location, status });
    await inst.save();
    res.json(inst);
  }),
);

adminRouter.put(
  '/institutions/:id',
  asyncHandler(async (req, res) => {
    const { name, slug, location, status } = req.body;
    const Institution = (await import('../models.js')).Institution;
    const inst = await Institution.findOne({ id: req.params.id }) || await Institution.findOne({ slug: req.params.id });
    if (!inst) throw notFound('Institution not found.');
    if (name) inst.name = name;
    if (slug) inst.slug = slug;
    if (location) inst.location = location;
    if (status) inst.status = status;
    await inst.save();
    res.json(inst);
  }),
);
`;

c = c.replace(/adminRouter\.post\(\n\s*'\/broadcast',/, newEndpoints + "\nadminRouter.post(\n  '/broadcast',");

fs.writeFileSync('backend/src/routes/admin.js', c);
console.log('Added admin institution endpoints');

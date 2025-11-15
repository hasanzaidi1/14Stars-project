# FAQ & Developer Tips

## Common Questions

**Q: Why do HTML pages 301 redirect when I include `.html`?**  
`redirectHtmlRequests` strips extensions for cleaner URLs. Request `/parents/parents_login` instead of `/parents/parents_login.html`.

**Q: How do I change session duration?**  
Set `SESSION_TTL_MINUTES` in `.env`. The custom store recalculates `maxAge` automatically.

**Q: Student registration fails even though the student is new.**  
Deduping uses `fname`, `lname`, and `DOB`. Verify casing and whitespace; consider enhancing `StudentModel.doesExist` if more nuanced matching is required.

**Q: Parent cannot see students after registering.**  
Ensure `student_guardian` entry exists for the logged-in guardian email or ID. Check `ParentModel.findStudents` results.

**Q: Substitute request always says duplicate.**  
Requests dedupe on `(teacher_email, date)`. Delete the existing request via admin view or choose another date.

## Developer Tips
- Use `LOG_LEVEL=debug` during development to inspect SQL metadata and request traces.
- When adding new modules, follow directory conventions (`*.routes.js`, `*.controller.js`, `*.model.js`) for consistency.
- Keep DB migrations synchronized; `schema.sql` serves as a baseline but consider adding a migration tool (Knex, Prisma Migrate).
- Wrap new portal forms with `helpers.sendPortalResponse` so both browser redirects and JSON clients behave uniformly.
- For new roles or permissions, extend `src/middlewares/authMiddleware.js` and set session flags during login.

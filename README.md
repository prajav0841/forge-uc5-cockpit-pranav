UC5 Cockpit is a prototype that lets finance leadership ask approved finance KPI questions in natural language and receive structured answers.(Esentially a ChatGPT 
interface that turn plain english queries into finance responses)

Example questions:
- Show AR aging by entity
- What is DSO by entity?
- Show bench utilization this month
- What is project margin by customer?

## Current Artifacts

- GitHub repo structure created
- Backend folder created for API code
- Docs folder created for architecture and KPI definitions
- Postman folder created for API test collection
- Screenshots folder created for demo proof

## Planned API Endpoints

- GET /api/v1/cockpit/health
- GET /api/v1/cockpit/kpis
- POST /api/v1/cockpit/queries
- GET /api/v1/cockpit/queries/:id
- GET /api/v1/cockpit/saved-views
- POST /api/v1/cockpit/saved-views

## Next Steps

1. Add backend API code.
2. Run the API locally.
3. Test endpoints in Postman.
4. Screenshot successful API responses.
5. Set up Intuit Developer QuickBooks Sandbox.
6. Connect sandbox data to the UC5 Cockpit API.

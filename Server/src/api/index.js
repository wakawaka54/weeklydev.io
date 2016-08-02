import users from './users/routes.js';
import teams from './teams/routes.js';
import surveys from './surveys/routes.js';
import submissions from './submissions/routes.js';
import projects from './projects/routes.js';

let routes = [
  ...users,
  ...teams,
  ...surveys,
  ...submissions,
  ...projects
];

export function getRoutes(prefix) {
  prefix = prefix || '';
  
  return routes.map(r => {
    r.path = `/${prefix}${r.path}`;
    return r;
  });
}
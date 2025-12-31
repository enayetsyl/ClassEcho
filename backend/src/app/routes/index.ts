import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ClassRoutes } from '../modules/master/class/class.routes';
import { SectionRoutes } from '../modules/master/section/section.routes';
import { SubjectRoutes } from '../modules/master/subject/subject.routes';
import { VideoRoutes } from '../modules/master/video/video.routes';
import { ReportsRoutes } from '../modules/reports/reports.routes';


const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  }, 
  {
    path: '/auth',
    route: AuthRoutes,
  }, 
  {
    path: '/admin/classes',
    route: ClassRoutes,
  }, 
  {
    path: '/admin/sections',
    route: SectionRoutes,
  }, 
  {
    path: '/admin/subjects',
    route: SubjectRoutes,
  }, 
  {
    path: '/admin/videos',
    route: VideoRoutes,
  },
  {
    path: '/admin/reports',
    route: ReportsRoutes,
  },

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));  // This will automatically loop your routes that you will add in the moduleRoutes array

export default router;
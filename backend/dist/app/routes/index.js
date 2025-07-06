"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = require("../modules/user/user.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const class_routes_1 = require("../modules/master/class/class.routes");
const section_routes_1 = require("../modules/master/section/section.routes");
const subject_routes_1 = require("../modules/master/subject/subject.routes");
const video_routes_1 = require("../modules/master/video/video.routes");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/users',
        route: user_routes_1.UserRoutes,
    },
    {
        path: '/auth',
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: '/admin/classes',
        route: class_routes_1.ClassRoutes,
    },
    {
        path: '/admin/sections',
        route: section_routes_1.SectionRoutes,
    },
    {
        path: '/admin/subjects',
        route: subject_routes_1.SubjectRoutes,
    },
    {
        path: '/admin/videos',
        route: video_routes_1.VideoRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route)); // This will automatically loop your routes that you will add in the moduleRoutes array
exports.default = router;

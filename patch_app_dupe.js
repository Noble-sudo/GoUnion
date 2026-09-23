import fs from 'fs';
let file = fs.readFileSync('frontend/App.jsx', 'utf8');
file = file.replace(
  'import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";\nimport React, { useEffect, useRef, useState } from "react";\nimport { BrowserRouter, Routes, Route, Navigate, useLocation, } from "react-router-dom";\nimport { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";\nimport { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";\nimport React, { useEffect, useRef, useState } from "react";\nimport { BrowserRouter, Routes, Route, Navigate, useLocation, } from "react-router-dom";\nimport { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";',
  'import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";\nimport React, { useEffect, useRef, useState } from "react";\nimport { BrowserRouter, Routes, Route, Navigate, useLocation, } from "react-router-dom";\nimport { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";'
);
fs.writeFileSync('frontend/App.jsx', file);

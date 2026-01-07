import { ComponentType, SVGProps } from "react";
import { Technology } from "@/types/course";
import JavaScript from "@/assets/icons/javascript";
import Typescript from "@/assets/icons/typescript";
import Python from "@/assets/icons/python";
import Php from "@/assets/icons/php";
import Cplusplus from "@/assets/icons/cplusplus";
import Csharp from "@/assets/icons/Csharp";
import Go from "@/assets/icons/go";
import Java from "@/assets/icons/javaIcon";
import Ruby from "@/assets/icons/ruby";
import Rust from "@/assets/icons/rust";
import Swift from "@/assets/icons/swift";
import React from "@/assets/icons/react";
import Laravel from "@/assets/icons/laravel";
import TailwindCSS from "@/assets/icons/tailwind";
import Lua from "@/assets/icons/lua";
import Kotlin from "@/assets/icons/kotlin";
import Dart from "@/assets/icons/dart";
import Cobol from "@/assets/icons/cobol";
import Fortran from "@/assets/icons/fortran";
import CSSNew from "@/assets/icons/css";
import HTML5 from "@/assets/icons/html";


export const technologyIcons: Record<
  Technology,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  html: HTML5,
  css: CSSNew,
  dart: Dart,
  cobol: Cobol,
  fortran: Fortran,
  javascript: JavaScript,
  typescript: Typescript,
  python: Python,
  php: Php,
  'c++': Cplusplus,
  'c#': Csharp,
  go: Go,
  java: Java,
  kotlin: Kotlin,
  lua: Lua,
  ruby: Ruby,
  rust: Rust,
  swift: Swift,

  react: React,
  laravel: Laravel,
  tailwind: TailwindCSS,
};
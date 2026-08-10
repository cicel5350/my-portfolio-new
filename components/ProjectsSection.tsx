"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight, Loader2, X } from "lucide-react";
import ScrollReveal, {
  ScrollRevealGroup,
  ScrollRevealItem,
} from "@/components/ScrollReveal";
import MagneticClickHint from "@/components/MagneticClickHint";
import Typewriter from "@/components/Typewriter";

const projectTitlePhrases = [
  "Things I've Designed",
  "Crafted Experiences",
  "Selected Works",
  "Products",
] as const;

const ALIBABA_DETAIL_BASE =
  "/projects/Alibaba%20Cloud%20Official%20Site%20Design";

const alibabaDetailBlocks = [
  {
    type: "heading" as const,
    text: "阿里云部分页面UI升级",
  },
  {
    type: "body" as const,
    text: "围绕支持与服务等核心页面进行 UI 升级，梳理信息层级与组件规范，让复杂云产品内容更易浏览、更易转化。",
  },
  {
    type: "subheading" as const,
    text: "支持与服务",
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-1.webp`,
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-2.webp`,
  },
  {
    type: "subheading" as const,
    text: "合作伙伴",
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-3.webp`,
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-4.webp`,
  },
  {
    type: "subheading" as const,
    text: "云市场",
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-5.webp`,
  },
  {
    type: "heading" as const,
    text: "插画与视觉表达",
    note: "阿里云官网已上线",
  },
  {
    type: "body" as const,
    text: "通过插画与视觉语言强化品牌气质，让产品能力与场景叙事更有温度。",
  },
  {
    type: "subheading" as const,
    text: "AI助理",
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-6.webp`,
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-7.webp`,
  },
  {
    type: "subheading" as const,
    text: "运营类插画",
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-8.webp`,
  },
  {
    type: "subheading" as const,
    text: "AI短剧创作 工具箱",
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-9.webp`,
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-11.mp4`,
  },
  {
    type: "subheading" as const,
    text: "千问大模型",
  },
  {
    type: "media" as const,
    src: [
      `${ALIBABA_DETAIL_BASE}/detail-13.mp4`,
      `${ALIBABA_DETAIL_BASE}/detail-14.mp4`,
    ] as const,
  },
  {
    type: "subheading" as const,
    text: "AI体验馆",
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-15.webp`,
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-16.mp4`,
  },
  {
    type: "heading" as const,
    text: "阿里云国际站",
  },
  {
    type: "body" as const,
    text: "面向国际站场景延续品牌一致性，同时适配多语言与全球化内容结构。",
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-17.webp`,
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-18.webp`,
  },
  {
    type: "media" as const,
    src: `${ALIBABA_DETAIL_BASE}/detail-19.webp`,
  },
] as const;

const DEFENSE_DETAIL_BASE =
  "/projects/Intelligent%20Defense%20System%20Design";

const defenseDetailBlocks = [
  {
    type: "subheading" as const,
    text: "飞机状态监测系统",
  },
  {
    type: "body" as const,
    text: "面向航空运行场景的智能监测系统，通过实时采集飞机运行数据，对关键状态指标进行可视化分析与异常预警，帮助用户快速掌握设备状态，提高航空运维效率与安全保障能力。\n\n我负责系统的信息架构梳理、数据可视化设计与交互体验优化。通过建立清晰的数据层级与视觉编码体系，将复杂的飞行状态数据转化为直观的信息呈现，降低用户认知成本，提升监测、分析与决策效率。",
  },
  {
    type: "media" as const,
    src: `${DEFENSE_DETAIL_BASE}/detail-1.mp4`,
  },
  {
    type: "media" as const,
    src: `${DEFENSE_DETAIL_BASE}/detail-2.mp4`,
  },
  {
    type: "media" as const,
    src: `${DEFENSE_DETAIL_BASE}/detail-3.mp4`,
  },
  {
    type: "media" as const,
    src: `${DEFENSE_DETAIL_BASE}/detail-4.mp4`,
  },
  {
    type: "media" as const,
    src: `${DEFENSE_DETAIL_BASE}/detail-5.mp4`,
  },
  {
    type: "subheading" as const,
    text: "军事防御 AI 决策系统",
  },
  {
    type: "body" as const,
    text: "面向军事防御场景的智能辅助决策平台，结合 AI 分析能力与多维数据融合，为指挥人员提供态势感知、风险评估与决策支持，提升复杂环境下的响应效率与决策准确性。\n\n我负责平台界面架构设计、核心功能模块设计及数据可视化表达。通过优化复杂任务流程与信息展示方式，将多源数据、分析结果与决策流程进行有效整合，构建高效、清晰的智能决策工作空间。",
  },
  {
    type: "media" as const,
    src: `${DEFENSE_DETAIL_BASE}/detail-6.mp4`,
  },
  {
    type: "media" as const,
    src: `${DEFENSE_DETAIL_BASE}/detail-7.mp4`,
  },
  {
    type: "media" as const,
    src: `${DEFENSE_DETAIL_BASE}/detail-8.mp4`,
  },
] as const;

const AURA_DETAIL_BASE = "/projects/Aura%20Stream";

const auraDetailBlocks = [
  {
    type: "heading" as const,
    text: "一、AI 协同开发过程",
  },
  {
    type: "subheading" as const,
    text: "1. 从设计意图到初始页面搭建",
  },
  {
    type: "body" as const,
    text: "首先，我将 Figma 中的设计语言和交互目标拆解后输入给 AI，包括：",
  },
  {
    type: "list" as const,
    items: [
      "深色沉浸式音乐场景",
      "3D 唱片空间展示",
      "胶囊形播放器控制栏",
      "高斯模糊氛围背景",
      "流畅的动态交互效果",
    ] as const,
  },
  {
    type: "body" as const,
    text: "AI 根据这些描述快速生成基础 HTML/CSS 结构，让原本停留在设计稿中的视觉方案快速转化为浏览器中可运行的页面。\n\n在这个阶段，我更像一个产品导演，通过不断调整视觉方向和体验细节，引导 AI 逐步接近设计目标。",
  },
  {
    type: "subheading" as const,
    text: "2. 以视觉体验驱动功能迭代",
  },
  {
    type: "body" as const,
    text: "在基础页面完成后，我开始围绕体验细节持续优化。",
  },
  {
    type: "topic" as const,
    text: "3D 唱片墙交互",
  },
  {
    type: "body" as const,
    text: "设计目标：\n\n希望唱片像真实空间中的实体一样排列，当前播放唱片突出显示，两侧唱片产生空间折叠和透视关系。\n\n我向 AI 描述交互逻辑后，由 AI 实现 3D Transform、位置计算以及滑动切换逻辑，最终形成具有空间层次感的唱片浏览体验。",
  },
  {
    type: "topic" as const,
    text: "动态吸色背景",
  },
  {
    type: "body" as const,
    text: "设计目标：\n\n背景颜色能够根据当前唱片封面变化，并形成柔和扩散的环境光效果。\n\nAI 根据需求实现封面颜色提取，并结合 Canvas 与模糊效果，让播放器背景能够随着音乐内容产生动态变化，增强沉浸感。",
  },
  {
    type: "topic" as const,
    text: "歌词同步滚动",
  },
  {
    type: "body" as const,
    text: "设计目标：\n\n歌词需要根据播放进度自动滚动，当前播放歌词保持居中并突出显示。\n\n通过向 AI 描述类似 Apple Music 的歌词体验，我引导 AI 调整时间轴计算、滚动位置以及动画效果，实现逐句同步、高亮和渐变过渡。",
  },
  {
    type: "heading" as const,
    text: "二、问题解决：从视觉反馈到 AI 调优",
  },
  {
    type: "body" as const,
    text: "Vibe Coding 最大的价值并不是完全依赖 AI 生成代码，而是设计师能够通过视觉判断发现问题，并将体验问题转化为 AI 可以理解的优化方向。",
  },
  {
    type: "subheading" as const,
    text: "1. 3D 唱片滑动时出现遮挡和穿模",
  },
  {
    type: "body" as const,
    text: "问题：\n\n初版唱片墙在滑动过程中，侧边唱片偶尔会覆盖中心唱片，导致视觉层级混乱，空间关系不符合预期。\n\n解决：\n\n虽然我不了解具体的 3D 矩阵计算逻辑，但通过视觉判断发现核心问题在于层级关系。\n\n我向 AI 提出：\n\n“当前播放唱片需要始终保持最高层级，两侧唱片随着距离增加降低层级，并保持向后的空间倾斜。”\n\nAI 根据反馈重新调整了位置计算和层级逻辑，使中心唱片始终成为视觉焦点。",
  },
  {
    type: "subheading" as const,
    text: "2. 背景切换生硬，动画出现卡顿",
  },
  {
    type: "body" as const,
    text: "问题：\n\n切换歌曲时，背景颜色变化过于突然，像简单的颜色替换；连续滑动唱片时也出现轻微卡顿。\n\n解决：\n\n我从体验角度向 AI 描述：\n\n“背景变化应该像环境光缓慢变化一样自然，同时整体动画需要保持流畅。”\n\nAI 优化了颜色过渡方式，并调整动画渲染逻辑，提升页面交互流畅度。",
  },
  {
    type: "subheading" as const,
    text: "3. 歌词同步偏移",
  },
  {
    type: "body" as const,
    text: "问题：\n\n切换歌曲后，歌词位置出现偏差，高亮歌词无法稳定保持在播放器中心区域。\n\n解决：\n\n我参考 Apple Music 的歌词体验，向 AI 明确提出：\n\n“当前歌词需要始终保持视觉中心，并通过渐变和滚动体现播放状态。”\n\nAI 重新调整歌词容器高度、行间距以及滚动计算方式，实现更加自然的歌词同步效果。",
  },
  {
    type: "heading" as const,
    text: "总结",
  },
  {
    type: "body" as const,
    text: "这次 Vibe Coding 实践让我重新理解了设计师与技术之间的关系。\n\nAI 并不是简单替代开发，而是成为设计师实现想法的新型协作伙伴。设计师需要做的，是明确表达设计意图、判断体验问题，并持续优化最终结果。\n\n当代码门槛降低后，设计师的价值不再只是输出视觉稿，而是能够更主动地参与产品实现，用设计思维推动想法真正落地。",
  },
  {
    type: "media" as const,
    src: `${AURA_DETAIL_BASE}/detail-1.webp`,
  },
  {
    type: "media" as const,
    src: `${AURA_DETAIL_BASE}/detail-2.webp`,
  },
  {
    type: "media" as const,
    src: `${AURA_DETAIL_BASE}/detail-3.mp4`,
  },
  {
    type: "media" as const,
    src: `${AURA_DETAIL_BASE}/detail-4.mp4`,
  },
] as const;

const DATA_VIZ_DETAIL_BASE = "/projects/Data%20Visualization";

const dataVizDetailBlocks = [
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-1.webp`,
  },
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-2.webp`,
  },
  {
    type: "body" as const,
    text: "本项目是一款面向城市低空空域管理与运行保障的“低空全域数据监测及服务平台”大屏可视化产品。系统以地理信息系统（GIS）地图为底座，结合物联网与大数据技术，实现了对低空无人机、航线、空域、飞行任务以及运行环境的实时动态监测与一体化智能管控。",
  },
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-3.webp`,
  },
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-4.webp`,
  },
  {
    type: "body" as const,
    text: "本项目是一款面向航空装备运维与管理领域的“装备数据智能系统”大屏数据可视化产品。系统以全方位保障装备战备完好率为核心，通过多维度的数据建模与可视化技术，实现了对航空装备关键部件、运行状态、航材库存、核心寿命及任务执行情况的实时监测与智能化预警。",
  },
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-5.mp4`,
  },
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-6.webp`,
  },
  {
    type: "body" as const,
    text: "系统通过多源数据与智能分析，对涉众线索、群体动态及重点人群进行监测与研判。首页以地图为核心，结合关键指标和图表，帮助快速掌握全市维稳态势。\n\n采用“中心地图 + 两侧图表”的布局，突出区域态势与数据对比。深色科技风格增强权威感，核心指标高亮显示，保证关键信息在大屏场景中一目了然。",
  },
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-7.webp`,
  },
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-8.webp`,
  },
  {
    type: "body" as const,
    text: "“西安经侦信风平台”是一款专为公安经侦部门打造的智能化实战与数据分析平台。平台紧密围绕“情报导侦、数据实战”的核心业务需求，通过前沿的大数据挖掘、可视化分析与虚拟资产追踪技术，打破数据壁垒，赋能一线侦查员，实现对经济犯罪的精准预警、高效打击与全链条态势掌控。\n\n在本项目中，我主要负责整体可视化设计与部分系统功能设计，致力于通过科学、直观、沉浸式的交互与视觉表现，将复杂的金融、涉案与时空数据转化为高效的实战决策支持。",
  },
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-9.mp4`,
  },
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-10.webp`,
  },
  {
    type: "media" as const,
    src: `${DATA_VIZ_DETAIL_BASE}/detail-11.mp4`,
  },
] as const;

const projects = [
  {
    id: "promo",
    title: "Track & Protect",
    tag: "APP Design",
    designDate: "2023",
    description:
      "SafePin，是一款主打家庭定位与安全守护的应用。它的核心目标是帮助家人实时了解海外子女的行踪，当出现异常情况时，系统能第一时间发出预警。\n\n在这个项目里，我主要负责从整体信息架构到UI视觉体系的设计。前期我调研了不同用户角色——家长和子女——在安全场景下的需求差异，然后设计了多角色入口和权限控制逻辑，确保体验上既安全又有亲和力。\n\n视觉上我希望它能传递‘守护感’而不是‘监控感’，logo外层提取了导航箭头的视觉符号，代表定位和方向感，内部融入心形元素，表达家人之间的关心与陪伴。整体通过圆润的造型和紫色渐变，让产品从‘监控工具’转变为‘家庭守护伙伴’。整体风格简洁、有层次感，也兼顾品牌识别度。\n\n在此期间锻炼了复杂逻辑场景的交互梳理能力，也提升了视觉体系的构建和延展能力。现在更擅长在安全、定位、监控等严肃主题中，通过设计语言去平衡理性与情感的表达。",
    thumbImage: "/projects/track-protect/cover.webp",
    detailImages: [
      "/projects/track-protect/detail-1.webp",
      "/projects/track-protect/detail-2.webp",
      "/projects/track-protect/detail-3.webp",
      "/projects/track-protect/detail-4.webp",
      "/projects/track-protect/detail-5.webp",
      "/projects/track-protect/detail-6.webp",
      "/projects/track-protect/detail-7.webp",
    ],
  },
  {
    id: "data-governance",
    title: "Intelligent Data Governance Platform",
    tag: "Data Governance Platform Design",
    designDate: "2025",
    description:
      "面向企业数据管理场景的数据治理平台，通过整合数据资产管理、质量监控、标签体系、模型能力与治理流程，帮助企业实现数据统一管理与价值挖掘。平台以空间化工作台为核心，为用户提供清晰、高效的数据治理协作体验。\n\n我负责平台整体信息架构梳理、核心页面设计与交互体验优化。通过重新规划功能模块与数据层级关系，将复杂的数据治理流程转化为直观、易理解的操作路径；同时结合可视化设计提升数据状态呈现效率，帮助用户快速发现问题、管理资产并推动数据价值转化。",
    thumbImage:
      "/projects/Intelligent%20Data%20Governance%20Platform/cover.webp",
    detailImages: [
      "/projects/Intelligent%20Data%20Governance%20Platform/detail-1.webp",
      "/projects/Intelligent%20Data%20Governance%20Platform/detail-2.webp",
      "/projects/Intelligent%20Data%20Governance%20Platform/detail-3.webp",
      "/projects/Intelligent%20Data%20Governance%20Platform/detail-4.webp",
      "/projects/Intelligent%20Data%20Governance%20Platform/detail-5.mp4",
      "/projects/Intelligent%20Data%20Governance%20Platform/detail-6.webp",
    ],
    detailSeamless: true,
  },
  {
    id: "qwen-cloud-ticket",
    title: "Qwen Cloud Ticket",
    tag: "Web Design",
    designDate: "2026",
    description:
      "作为千问云（QWENCLOUD）海外版控制台体验升级的一部分，主要负责了工单服务模块（Ticket Support System）页面的交互与视觉设计。该项目旨在解决海外 AI 开发者在模型部署、API 调优及计费中遇到技术难题时流程冗长、描述不准及沟通成本高等痛点，通过打造低门槛发起、IM 模式高效沟通与全状态可视化的服务闭环，显著提升了海外用户的技术支持服务体验。",
    descriptionLink: "https://www.qwencloud.com/",
    thumbImage: "/projects/Qwen%20Cloud%20Ticket/cover.webp",
    detailImages: [
      "/projects/Qwen%20Cloud%20Ticket/detail-1.webp",
      "/projects/Qwen%20Cloud%20Ticket/detail-2.webp",
      "/projects/Qwen%20Cloud%20Ticket/detail-3.webp",
      "/projects/Qwen%20Cloud%20Ticket/detail-4.webp",
      "/projects/Qwen%20Cloud%20Ticket/detail-5.webp",
      "/projects/Qwen%20Cloud%20Ticket/detail-6.webp",
      "/projects/Qwen%20Cloud%20Ticket/detail-7.webp",
      "/projects/Qwen%20Cloud%20Ticket/detail-8.webp",
      "/projects/Qwen%20Cloud%20Ticket/detail-9.webp",
      "/projects/Qwen%20Cloud%20Ticket/detail-10.webp",
      "/projects/Qwen%20Cloud%20Ticket/detail-11.webp",
    ],
  },
  {
    id: "alibaba-cloud-official-site",
    title: "Alibaba Cloud Official Site Design",
    tag: "Web Design",
    designDate: "2026",
    description:
      "参与阿里云官网外包设计项目，负责官网页面的视觉升级与体验优化。围绕云计算产品的品牌表达与用户浏览体验，对页面视觉风格、UI 组件体系、动态交互效果及插画创意进行全面优化，提升官网整体的科技感、品牌一致性与信息传达效率。",
    descriptionLink: "https://www.aliyun.com/",
    thumbImage:
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/cover.webp",
    detailImages: [
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-1.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-2.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-3.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-4.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-5.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-6.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-7.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-8.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-9.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-11.mp4",
      [
        "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-13.mp4",
        "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-14.mp4",
      ],
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-15.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-16.mp4",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-17.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-18.webp",
      "/projects/Alibaba%20Cloud%20Official%20Site%20Design/detail-19.webp",
    ],
    detailBlocks: alibabaDetailBlocks,
  },
  {
    id: "data-visualization",
    title: "Data Visualization",
    tag: "Web Design",
    designDate: "2025",
    description:
      "作为一名专注UI/UX与视觉交互的设计师，我擅长将复杂、高密度的业务数据转化为具象、直观且具备沉浸感的大屏视觉语言。\n\n在 B 端及指挥决策大屏设计领域，我始终秉持“视觉服务于业务”的设计理念。不仅追求科技感与视觉张力的极致呈现，更注重数据层级的清晰梳理、空间布局的合理调度以及核心指标的快速调取。从装备智能运维、低空全域感知到复杂的警务数据实战平台，我深度参与了多个核心大屏项目的全流程视觉构建、3D 场景资产联动与系统交互设计，致力于用精细化的设计赋能指挥决策，让“数据看得到，重点看得清，决策更高效”。",
    thumbImage: "/projects/Data%20Visualization/cover.webp",
    detailImages: [
      "/projects/Data%20Visualization/detail-1.webp",
      "/projects/Data%20Visualization/detail-2.webp",
      "/projects/Data%20Visualization/detail-3.webp",
      "/projects/Data%20Visualization/detail-4.webp",
      "/projects/Data%20Visualization/detail-5.mp4",
      "/projects/Data%20Visualization/detail-6.webp",
      "/projects/Data%20Visualization/detail-7.webp",
      "/projects/Data%20Visualization/detail-8.webp",
      "/projects/Data%20Visualization/detail-9.mp4",
      "/projects/Data%20Visualization/detail-10.webp",
      "/projects/Data%20Visualization/detail-11.mp4",
    ],
    detailBlocks: dataVizDetailBlocks,
  },
  {
    id: "digital-agriculture-platform",
    title: "Digital Agriculture Platform",
    tag: "Web Design",
    designDate: "2023",
    description:
      "数字三农是一套面向农业产业链的数字化管理平台，旨在通过数据驱动提升农业生产与运营效率。设计围绕多角色、多业务场景展开，将复杂的农业数据进行结构化呈现，打造直观、高效的可视化管理体验，助力农业数字化转型与智慧农业发展。",
    thumbImage: "/projects/Digital%20Agriculture%20Platform/cover.webp",
    detailImages: [
      "/projects/Digital%20Agriculture%20Platform/detail-1.webp",
      "/projects/Digital%20Agriculture%20Platform/detail-2.webp",
      "/projects/Digital%20Agriculture%20Platform/detail-4.webp",
      "/projects/Digital%20Agriculture%20Platform/detail-5.webp",
      "/projects/Digital%20Agriculture%20Platform/detail-6.webp",
      "/projects/Digital%20Agriculture%20Platform/detail-7.webp",
    ],
  },
  {
    id: "intelligent-defense-system",
    title: "Intelligent Defense System Design",
    tag: "Enterprise UX",
    designDate: "2023",
    description:
      "深度参与多个军工领域数字化系统设计，探索复杂数据环境下的信息呈现与智能决策体验，积累了面向高复杂度 B 端产品的系统设计与可视化设计经验。",
    thumbImage:
      "/projects/Intelligent%20Defense%20System%20Design/cover.webp",
    detailImages: [
      "/projects/Intelligent%20Defense%20System%20Design/detail-1.mp4",
      "/projects/Intelligent%20Defense%20System%20Design/detail-2.mp4",
      "/projects/Intelligent%20Defense%20System%20Design/detail-3.mp4",
      "/projects/Intelligent%20Defense%20System%20Design/detail-4.mp4",
      "/projects/Intelligent%20Defense%20System%20Design/detail-5.mp4",
      "/projects/Intelligent%20Defense%20System%20Design/detail-6.mp4",
      "/projects/Intelligent%20Defense%20System%20Design/detail-7.mp4",
      "/projects/Intelligent%20Defense%20System%20Design/detail-8.mp4",
    ],
    detailBlocks: defenseDetailBlocks,
  },
  {
    id: "aura-stream",
    title: "Aura Stream",
    detailTitle: "Vibe Coding 实践：从设计稿到真实产品的 AI 协同探索",
    tag: "Vibe Coding",
    designDate: "2026",
    description:
      "对AI Coding比较感兴趣，但是没有编程背景，我尝试通过 Vibe Coding 完成一次完整的 Design-to-Code 探索。\n\n在这个过程中，我没有直接编写代码，而是将自己的设计思考、视觉规范和交互体验转化为自然语言，与 AI 进行协作。AI 负责实现技术逻辑，而我更多关注产品体验、视觉质量以及最终呈现效果，通过不断观察、反馈和调整，让设计从 Figma 里的静态界面真正变成可交互的产品。",
    thumbImage: "/projects/Aura%20Stream/cover.webp",
    detailImages: [
      "/projects/Aura%20Stream/detail-1.webp",
      "/projects/Aura%20Stream/detail-2.webp",
      "/projects/Aura%20Stream/detail-3.mp4",
      "/projects/Aura%20Stream/detail-4.mp4",
    ],
    detailBlocks: auraDetailBlocks,
  },
] as const;

type DetailSrc = string | readonly string[];

type DetailBlock =
  | { type: "media"; src: DetailSrc }
  | { type: "heading"; text: string; note?: string }
  | { type: "subheading"; text: string }
  | { type: "topic"; text: string }
  | { type: "body"; text: string }
  | { type: "list"; items: readonly string[] };

type Project = (typeof projects)[number] & {
  detailSeamless?: boolean;
  detailBlocks?: readonly DetailBlock[];
  detailTitle?: string;
  descriptionLink?: string;
};

function isVideoSrc(src: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(src);
}

function flattenDetailSrcs(items: readonly DetailSrc[]) {
  return items.flatMap((item) => (typeof item === "string" ? [item] : [...item]));
}

/** Media srcs in the same order the detail modal renders them. */
function getDetailMediaSrcs(project: Project): string[] {
  if (project.detailBlocks) {
    return project.detailBlocks.flatMap((block) => {
      if (block.type !== "media") return [];
      return typeof block.src === "string" ? [block.src] : [...block.src];
    });
  }
  return flattenDetailSrcs(project.detailImages);
}

function getFirstStillSrcs(srcs: readonly string[], count: number) {
  const stills: string[] = [];
  for (const src of srcs) {
    if (isVideoSrc(src)) continue;
    stills.push(src);
    if (stills.length >= count) break;
  }
  return stills;
}

const DETAIL_CONTENT_X = "px-8 sm:px-10";
/** Outer inset matches media; inner border matches image content width. */
const DETAIL_RULE_OUTER = DETAIL_CONTENT_X;
const DETAIL_RULE_INNER = "border-t border-white/15 pb-6 pt-6";

function DetailCopyBlock({
  type,
  text,
  note,
  items,
  sectionBreak = false,
}: {
  type: "heading" | "subheading" | "topic" | "body" | "list";
  text?: string;
  note?: string;
  items?: readonly string[];
  /** Extra top space when starting a new content chapter after media */
  sectionBreak?: boolean;
}) {
  if (type === "heading") {
    return (
      <div className={DETAIL_RULE_OUTER}>
        <div
          className={
            sectionBreak
              ? "border-t border-white/15 pb-6 pt-16 sm:pt-20"
              : DETAIL_RULE_INNER
          }
        >
          <h4 className="font-inter text-[28px] font-semibold leading-snug tracking-tight text-white">
            {text}
            {note ? (
              <span className="ml-2 text-[16px] font-normal text-white/70">
                （{note}）
              </span>
            ) : null}
          </h4>
        </div>
      </div>
    );
  }

  if (type === "subheading") {
    return (
      <div className={DETAIL_RULE_OUTER}>
        <div
          className={
            sectionBreak
              ? "border-t border-white/15 pb-2 pt-16 sm:pt-20"
              : "border-t border-white/15 pb-2 pt-6"
          }
        >
          <h5 className="font-inter text-[22px] font-semibold leading-snug tracking-tight text-white">
            {text}
          </h5>
        </div>
      </div>
    );
  }

  if (type === "topic") {
    return (
      <div className={DETAIL_RULE_OUTER}>
        <div className={DETAIL_RULE_INNER}>
          <h6 className="font-inter text-[18px] font-semibold leading-snug tracking-tight text-white">
            {text}
          </h6>
        </div>
      </div>
    );
  }

  if (type === "list") {
    return (
      <ul
        className={`font-inter ${DETAIL_CONTENT_X} flex w-full list-disc flex-col gap-1 pb-6 pl-6 text-[16px] font-normal leading-[1.55] text-white/65 marker:text-white/45`}
      >
        {(items ?? []).map((item) => (
          <li key={item} className="w-full pl-1">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={`font-inter ${DETAIL_CONTENT_X} flex w-full flex-col gap-2.5 pt-3 pb-8 text-[16px] font-normal leading-[1.55] text-white/65`}
    >
      {(text ?? "").split(/\n\n+/).map((paragraph) => (
        <p key={paragraph} className="w-full">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

type DetailLightboxState = {
  src: string;
  alt: string;
};

function DetailImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center bg-black/92 px-4 py-6 sm:px-8"
      onClick={onClose}
      onContextMenu={(event) => event.preventDefault()}
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image"
    >
      <button
        type="button"
        aria-label="Close enlarged image"
        onClick={onClose}
        className="fixed right-5 top-5 z-[81] flex h-10 w-10 items-center justify-center text-white/80 transition hover:text-white sm:right-8 sm:top-6"
      >
        <X className="h-7 w-7" strokeWidth={1.5} />
      </button>

      <div
        className="relative flex max-h-full max-w-full items-center justify-center"
        onClick={(event) => event.stopPropagation()}
        onContextMenu={(event) => event.preventDefault()}
      >
        <Image
          src={src}
          alt={alt}
          width={2400}
          height={1600}
          quality={90}
          unoptimized
          draggable={false}
          sizes="96vw"
          className="h-auto max-h-[min(92vh,100%)] w-auto max-w-[min(1440px,96vw)] cursor-zoom-out select-none object-contain"
          onContextMenu={(event) => event.preventDefault()}
          onClick={onClose}
        />
      </div>
    </div>,
    document.body,
  );
}

function ZoomableDetailImage({
  src,
  alt,
  priority = false,
  sizes,
  imageClassName,
  buttonClassName,
  onZoom,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  imageClassName: string;
  buttonClassName: string;
  onZoom: (src: string, alt: string) => void;
}) {
  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={() => onZoom(src, alt)}
      onContextMenu={(event) => event.preventDefault()}
      aria-label={`Enlarge ${alt}`}
    >
      <Image
        src={src}
        alt={alt}
        width={1440}
        height={900}
        quality={80}
        draggable={false}
        priority={priority}
        sizes={sizes}
        className={imageClassName}
        onContextMenu={(event) => event.preventDefault()}
      />
    </button>
  );
}

function DetailMediaBlock({
  item,
  title,
  index,
  priority = false,
  videoEager = false,
  alignStart = false,
  onZoomImage,
}: {
  item: DetailSrc;
  title: string;
  index: number;
  priority?: boolean;
  /** First-screen video may use metadata preload */
  videoEager?: boolean;
  alignStart?: boolean;
  onZoomImage: (src: string, alt: string) => void;
}) {
  const sources = typeof item === "string" ? [item] : [...item];
  const paired = sources.length > 1;
  const insetScale = sources.some((src) => /\/detail-16\./i.test(src));
  const dataVizFramedVideo = sources.some(
    (src) =>
      /Data(%20|\s)?Visualization/i.test(src) &&
      /\/detail-(5|9|11)\./i.test(src),
  );

  const justifyClass = alignStart ? "justify-start" : "justify-center";
  const gutterClass = alignStart ? DETAIL_CONTENT_X : "";

  return (
    <div
      className={
        paired
          ? `relative w-full select-none bg-[#1a1a1a] leading-none ${gutterClass}`
          : dataVizFramedVideo
            ? alignStart
              ? // Match image/text content width (gutter), keep black stage inside.
                `relative flex w-full ${justifyClass} select-none bg-[#1a1a1a] leading-none ${gutterClass}`
              : `relative flex w-full ${justifyClass} select-none bg-black leading-none`
            : insetScale
              ? alignStart
                ? // Keep page bg outside; white stage matches other media width.
                  `relative flex w-full ${justifyClass} select-none bg-[#1a1a1a] leading-none ${gutterClass}`
                : `relative flex w-full ${justifyClass} select-none bg-white leading-none`
              : `relative flex w-full ${justifyClass} select-none bg-[#1a1a1a] leading-none ${gutterClass}`
      }
    >
      {paired ? (
        <div
          className={`project-detail-row project-detail-row--panel ${
            alignStart ? "project-detail-row--start" : ""
          }`}
        >
          {sources.map((src, mediaIndex) => (
            <DetailMedia
              key={src}
              src={src}
              alt={`${title} detail ${index + 1}-${mediaIndex + 1}`}
              priority={priority && mediaIndex === 0}
              videoEager={videoEager && mediaIndex === 0}
              paired
              alignStart={alignStart}
              onZoomImage={onZoomImage}
            />
          ))}
        </div>
      ) : (
        sources.map((src, mediaIndex) => (
          <DetailMedia
            key={src}
            src={src}
            alt={`${title} detail ${index + 1}`}
            priority={priority && mediaIndex === 0}
            videoEager={videoEager && mediaIndex === 0}
            alignStart={alignStart}
            onZoomImage={onZoomImage}
          />
        ))
      )}
    </div>
  );
}

/** Defer mounting heavy media until near the viewport (first N stay eager). */
function LazyMountDetailMediaBlock({
  eager,
  videoEager,
  ...props
}: {
  eager: boolean;
  videoEager?: boolean;
  item: DetailSrc;
  title: string;
  index: number;
  priority?: boolean;
  alignStart?: boolean;
  onZoomImage: (src: string, alt: string) => void;
}) {
  const { ref, inView } = useInView({
    rootMargin: "280px 0px",
    threshold: 0,
    triggerOnce: true,
  });
  const [mounted, setMounted] = useState(eager);

  useEffect(() => {
    if (inView) setMounted(true);
  }, [inView]);

  if (!mounted) {
    return (
      <div
        ref={ref}
        className="w-full min-h-[min(52vh,520px)] bg-[#1a1a1a]"
        aria-hidden
      />
    );
  }

  return (
    <div ref={ref}>
      <DetailMediaBlock {...props} videoEager={videoEager} />
    </div>
  );
}

/** Load/play video only near viewport to avoid opening-time bandwidth storms. */
function LazyDetailVideo({
  src,
  className,
  alt,
  eager = false,
}: {
  src: string;
  className: string;
  alt: string;
  eager?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { ref, inView } = useInView({
    rootMargin: "220px 0px",
    threshold: 0.05,
  });
  const [shouldLoad, setShouldLoad] = useState(eager);

  useEffect(() => {
    if (inView) setShouldLoad(true);
  }, [inView]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldLoad) return;

    if (inView) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [inView, shouldLoad, src]);

  const setRefs = (node: HTMLVideoElement | null) => {
    videoRef.current = node;
    ref(node);
  };

  return (
    <video
      ref={setRefs}
      src={shouldLoad ? src : undefined}
      className={className}
      muted
      loop
      playsInline
      controls
      preload={eager ? "metadata" : "none"}
      controlsList="nodownload"
      disablePictureInPicture
      onContextMenu={(event) => event.preventDefault()}
      aria-label={alt}
    />
  );
}

function DetailMedia({
  src,
  alt,
  priority = false,
  videoEager = false,
  paired = false,
  alignStart = false,
  onZoomImage,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  videoEager?: boolean;
  paired?: boolean;
  alignStart?: boolean;
  onZoomImage: (src: string, alt: string) => void;
}) {
  const insetScale = /\/detail-16\./i.test(src);
  const dataVizFramedVideo =
    /Data(%20|\s)?Visualization/i.test(src) &&
    /\/detail-(5|9|11)\./i.test(src);

  if (isVideoSrc(src)) {
    const videoClassName = paired
      ? "project-detail-video project-detail-video--pair"
      : dataVizFramedVideo
        ? alignStart
          ? "project-detail-video project-detail-video--start"
          : "project-detail-video project-detail-video--w1230"
        : insetScale
          ? "project-detail-video project-detail-video--inset"
          : alignStart
            ? "project-detail-video project-detail-video--start"
            : "project-detail-video";

    const video = (
      <LazyDetailVideo
        src={src}
        className={videoClassName}
        alt={alt}
        eager={videoEager}
      />
    );

    if (dataVizFramedVideo && !paired) {
      return (
        <div
          className={`project-detail-video-frame--dark ${
            alignStart ? "project-detail-video-frame--start" : ""
          }`}
        >
          {video}
        </div>
      );
    }

    if (insetScale && !paired) {
      return (
        <div
          className={`flex w-full justify-center bg-white ${
            alignStart ? "" : "max-w-[1440px]"
          }`}
        >
          {video}
        </div>
      );
    }

    return video;
  }

  if (insetScale && !paired) {
    return (
      <div
        className={`flex w-full justify-center bg-white ${
          alignStart ? "" : "max-w-[1440px]"
        }`}
      >
        <ZoomableDetailImage
          src={src}
          alt={alt}
          priority={priority}
          sizes="(max-width: 1440px) 100vw, 1152px"
          buttonClassName="block w-[60%] cursor-zoom-in border-0 bg-transparent p-0"
          imageClassName="pointer-events-none block h-auto w-full select-none"
          onZoom={onZoomImage}
        />
      </div>
    );
  }

  return (
    <ZoomableDetailImage
      src={src}
      alt={alt}
      priority={priority}
      sizes={
        paired
          ? "(max-width: 768px) 100vw, 720px"
          : "(max-width: 1440px) 100vw, 1440px"
      }
      buttonClassName={
        paired
          ? "max-w-full cursor-zoom-in border-0 bg-transparent p-0"
          : "block w-full cursor-zoom-in border-0 bg-transparent p-0"
      }
      imageClassName={
        paired
          ? "pointer-events-none block h-auto w-auto max-w-full select-none"
          : "pointer-events-none block h-auto w-full select-none"
      }
      onZoom={onZoomImage}
    />
  );
}

type ProjectsSectionProps = {
  onInViewChange?: (inView: boolean) => void;
};

type ProjectCardProps = {
  project: Project;
  onOpen: (project: Project) => void;
};

function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(project);
        }
      }}
      className="group flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-[#f3f4f6]">
        {/*
          Blur/scale stay on a pointer-events-none layer so Chromium hit-testing
          does not flicker while the section-level cursor follows the pointer.
        */}
        <div className="pointer-events-none absolute inset-0 transition duration-500 ease-out group-hover:scale-105 group-hover:blur-sm">
          <Image
            src={project.thumbImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={80}
            className="object-cover"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-500 ease-out group-hover:bg-black/20" />
      </div>

      <div className="mt-5">
        <p className="font-inter text-sm font-normal text-[#9ca3af]">
          {project.tag}
        </p>
        <h3 className="font-inter mt-1.5 text-xl font-semibold leading-snug tracking-tight text-black sm:text-[22px]">
          {project.title}
        </h3>
      </div>
    </article>
  );
}

export default function ProjectsSection({
  onInViewChange,
}: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailLightbox, setDetailLightbox] =
    useState<DetailLightboxState | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cursorMounted, setCursorMounted] = useState(false);
  const [cursorActive, setCursorActive] = useState(false);
  const detailScrollRef = useRef<HTMLDivElement | null>(null);
  const detailScrollTimerRef = useRef<number | null>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorLeft = useSpring(cursorX, {
    stiffness: 500,
    damping: 40,
    mass: 0.25,
  });
  const cursorTop = useSpring(cursorY, {
    stiffness: 500,
    damping: 40,
    mass: 0.25,
  });

  useEffect(() => {
    setCursorMounted(true);
  }, []);

  const handleContentPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (selectedProject) return;
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(min-width: 768px)").matches
    ) {
      return;
    }
    cursorX.jump(event.clientX);
    cursorY.jump(event.clientY);
    setCursorActive(true);
  };

  const handleContentPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (selectedProject) return;
    cursorX.set(event.clientX);
    cursorY.set(event.clientY);
  };

  const handleContentPointerLeave = () => {
    setCursorActive(false);
  };

  const showDetailScrollbar = () => {
    const el = detailScrollRef.current;
    if (!el) return;

    el.classList.add("is-scrolling");

    if (detailScrollTimerRef.current !== null) {
      window.clearTimeout(detailScrollTimerRef.current);
    }

    detailScrollTimerRef.current = window.setTimeout(() => {
      if (!el.matches(":hover") && !el.dataset.scrollbarHover) {
        el.classList.remove("is-scrolling");
      }
      detailScrollTimerRef.current = null;
    }, 900);
  };

  const handleDetailScroll = () => {
    showDetailScrollbar();
  };

  const handleDetailMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = detailScrollRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const nearScrollbar = rect.right - event.clientX <= 16;
    el.dataset.scrollbarHover = nearScrollbar ? "1" : "";

    if (nearScrollbar) {
      el.classList.add("is-scrolling");
      if (detailScrollTimerRef.current !== null) {
        window.clearTimeout(detailScrollTimerRef.current);
        detailScrollTimerRef.current = null;
      }
      return;
    }

    if (!el.classList.contains("is-scrolling")) return;

    if (detailScrollTimerRef.current === null) {
      detailScrollTimerRef.current = window.setTimeout(() => {
        if (!el.dataset.scrollbarHover) {
          el.classList.remove("is-scrolling");
        }
        detailScrollTimerRef.current = null;
      }, 400);
    }
  };

  const handleDetailMouseLeave = () => {
    const el = detailScrollRef.current;
    if (!el) return;
    el.dataset.scrollbarHover = "";
    el.classList.remove("is-scrolling");
    if (detailScrollTimerRef.current !== null) {
      window.clearTimeout(detailScrollTimerRef.current);
      detailScrollTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (detailScrollTimerRef.current !== null) {
        window.clearTimeout(detailScrollTimerRef.current);
      }
    };
  }, []);

  // Middle-band detection: with a tall project list, a high threshold never
  // fires when "Selected Works" is pinned to the visual center.
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "-42% 0px -42% 0px",
  });

  useEffect(() => {
    onInViewChange?.(inView);
  }, [inView, onInViewChange]);

  useEffect(() => {
    if (!selectedProject) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (detailLightbox) {
        setDetailLightbox(null);
        return;
      }

      setSelectedProject(null);
      setDetailLoading(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedProject, detailLightbox]);

  useEffect(() => {
    if (!selectedProject) return;

    let cancelled = false;
    setDetailLoading(true);

    const finish = () => {
      if (!cancelled) setDetailLoading(false);
    };

    // Never leave the modal stuck on a spinner if preload hangs
    const timeoutId = window.setTimeout(finish, 1400);

    const mediaSrcs = getDetailMediaSrcs(selectedProject);
    const stills = getFirstStillSrcs(mediaSrcs, 2);

    if (stills.length === 0) {
      window.clearTimeout(timeoutId);
      finish();
      return () => {
        cancelled = true;
      };
    }

    let remaining = stills.length;
    const images = stills.map((src) => {
      const img = new window.Image();
      const done = () => {
        remaining -= 1;
        if (remaining <= 0) {
          window.clearTimeout(timeoutId);
          finish();
        }
      };
      img.onload = done;
      img.onerror = done;
      img.src = src;
      return img;
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      for (const img of images) {
        img.onload = null;
        img.onerror = null;
      }
    };
  }, [selectedProject]);

  const openProject = (project: Project) => {
    setDetailLoading(true);
    setSelectedProject(project);
  };

  const openDetailLightbox = (src: string, alt: string) => {
    setDetailLightbox({ src, alt });
  };

  const closeDetailLightbox = () => {
    setDetailLightbox(null);
  };

  const closeProject = () => {
    if (detailScrollTimerRef.current !== null) {
      window.clearTimeout(detailScrollTimerRef.current);
      detailScrollTimerRef.current = null;
    }
    detailScrollRef.current?.classList.remove("is-scrolling");
    setDetailLightbox(null);
    setSelectedProject(null);
    setDetailLoading(false);
  };

  const showProjectCursor = cursorActive && !selectedProject;

  return (
    <section
      id="projects"
      ref={ref}
      className="relative scroll-mt-0 bg-white px-4 pb-44 pt-[min(38vh,320px)] sm:px-6 sm:pb-52 lg:px-8 lg:pb-64"
    >
      <div className="mx-auto w-full max-w-6xl">
        <ScrollReveal>
          <div className="flex w-full max-w-[904px] flex-col items-start gap-8 sm:gap-10">
            <h2
              data-nav-focus
              className="font-inter text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.15] tracking-tight text-black"
            >
              <Typewriter
                texts={projectTitlePhrases}
                active={inView}
                typeSpeed={0.05}
                holdTime={1.1}
                deleteSpeed={0.07}
                cursorChar="_"
              />
            </h2>
            <p className="font-inter text-[28px] font-normal leading-normal text-[#1D2129]">
              “A collection of digital products, AI experiences,
              <br />
              and interface systems I&apos;ve crafted.”
            </p>
          </div>
        </ScrollReveal>

        <div
          onPointerEnter={handleContentPointerEnter}
          onPointerMove={handleContentPointerMove}
          onPointerLeave={handleContentPointerLeave}
          className={`relative mt-16 sm:mt-20 ${showProjectCursor ? "md:cursor-none" : ""}`}
        >
          {/* Right margin — original arc */}
          <MagneticClickHint
            side="right"
            src="/projects/cursor.png"
            className="left-[calc(100%+0.25rem)] top-10 hidden xl:block 2xl:left-[calc(100%+0.75rem)] 2xl:top-14"
          />
          {/* Left margin — mirrored arc, lower so not on the same line */}
          <MagneticClickHint
            side="left"
            src="/projects/cursor2.png"
            phaseOffset={Math.PI * 0.85}
            className="right-[calc(100%+0.25rem)] top-[30rem] hidden xl:block 2xl:right-[calc(100%+0.75rem)] 2xl:top-[34rem]"
          />

          <ScrollRevealGroup
            className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2"
            stagger={0.1}
            delayChildren={0.08}
          >
            {projects.map((project) => (
              <ScrollRevealItem key={project.id}>
                <ProjectCard project={project} onOpen={openProject} />
              </ScrollRevealItem>
            ))}
          </ScrollRevealGroup>
        </div>
      </div>

      {cursorMounted
        ? createPortal(
            <motion.div
              className="hidden md:block"
              style={{
                position: "fixed",
                top: cursorTop,
                left: cursorLeft,
                x: "-50%",
                y: "-50%",
                pointerEvents: "none",
                zIndex: 40,
              }}
              initial={false}
              animate={{
                opacity: showProjectCursor ? 1 : 0,
                scale: showProjectCursor ? 1 : 0.92,
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <div className="flex items-center rounded-full bg-white py-1.5 pl-5 pr-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                <span className="font-inter pr-3 text-[15px] font-semibold tracking-tight text-black">
                  View Project
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                  <ArrowRight className="h-4 w-4 text-white" strokeWidth={2} />
                </span>
              </div>
            </motion.div>,
            document.body,
          )
        : null}

      {selectedProject && (
        <div
          className="fixed inset-0 z-50 cursor-auto bg-[#1a1a1a]"
          onClick={closeProject}
        >
          <button
            type="button"
            aria-label="Close project details"
            onClick={closeProject}
            className="fixed right-5 top-5 z-[60] flex h-10 w-10 items-center justify-center text-white/80 transition hover:text-white sm:right-8 sm:top-6"
          >
            <X className="h-7 w-7" strokeWidth={1.5} />
          </button>

          {detailLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2
                className="h-8 w-8 animate-spin text-white/70"
                strokeWidth={1.75}
                aria-label="Loading"
              />
            </div>
          ) : (
            <div
              ref={detailScrollRef}
              className="project-detail-scroll h-full overflow-y-auto overscroll-contain"
              onScroll={handleDetailScroll}
              onMouseMove={handleDetailMouseMove}
              onMouseLeave={handleDetailMouseLeave}
              onClick={(event) => event.stopPropagation()}
              onContextMenu={(event) => event.preventDefault()}
            >
              <div className="relative mx-auto w-full max-w-[1440px] bg-[#1a1a1a]">
                <header className="px-8 py-8 sm:px-10 sm:py-10">
                  <div className="flex items-start justify-between gap-6">
                    <h3 className="font-inter max-w-[70%] text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-[28px]">
                      {"detailTitle" in selectedProject &&
                      selectedProject.detailTitle
                        ? selectedProject.detailTitle
                        : selectedProject.title}
                    </h3>
                    <p className="font-inter shrink-0 pt-1 text-right text-sm font-normal text-white/80 sm:text-base">
                      <span>{selectedProject.designDate}</span>
                      <span className="mx-3 text-white/35">·</span>
                      <span>{selectedProject.tag}</span>
                    </p>
                  </div>

                  <div className="mt-6 border-t border-white/15 pt-6">
                    <div className="font-inter flex w-full flex-col gap-2.5 text-[16px] font-normal leading-[1.55] text-white/65">
                      {selectedProject.description
                        .split(/\n\n+/)
                        .map((paragraph) => (
                          <p key={paragraph} className="w-full">
                            {paragraph}
                          </p>
                        ))}
                      {"descriptionLink" in selectedProject &&
                      selectedProject.descriptionLink ? (
                        <p className="w-full">
                          <a
                            href={selectedProject.descriptionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white/60"
                          >
                            {selectedProject.descriptionLink}
                          </a>
                        </p>
                      ) : null}
                    </div>
                  </div>
                </header>

                <div className="flex flex-col gap-0">
                  {"detailBlocks" in selectedProject &&
                  selectedProject.detailBlocks
                    ? (() => {
                        const blocks = selectedProject.detailBlocks;
                        const firstMediaIndex = blocks.findIndex(
                          (block) => block.type === "media",
                        );
                        let mediaOrdinal = 0;

                        return blocks.map((block, index) => {
                          if (block.type === "media") {
                            const ordinal = mediaOrdinal;
                            mediaOrdinal += 1;
                            return (
                              <LazyMountDetailMediaBlock
                                key={`media-${index}-${
                                  typeof block.src === "string"
                                    ? block.src
                                    : block.src.join("|")
                                }`}
                                eager={ordinal < 2}
                                videoEager={ordinal === 0}
                                item={block.src}
                                title={selectedProject.title}
                                index={index}
                                priority={index === firstMediaIndex}
                                alignStart
                                onZoomImage={openDetailLightbox}
                              />
                            );
                          }

                          if (block.type === "list") {
                            return (
                              <DetailCopyBlock
                                key={`list-${index}`}
                                type="list"
                                items={block.items}
                              />
                            );
                          }

                          const prev = index > 0 ? blocks[index - 1] : null;
                          const sectionBreak =
                            (block.type === "heading" ||
                              block.type === "subheading") &&
                            prev?.type === "media";

                          return (
                            <DetailCopyBlock
                              key={`${block.type}-${index}-${block.text}`}
                              type={block.type}
                              text={block.text}
                              note={
                                block.type === "heading"
                                  ? block.note
                                  : undefined
                              }
                              sectionBreak={sectionBreak}
                            />
                          );
                        });
                      })()
                    : selectedProject.detailImages.map((item, index) => (
                        <LazyMountDetailMediaBlock
                          key={
                            typeof item === "string" ? item : item.join("|")
                          }
                          eager={index < 2}
                          videoEager={index === 0}
                          item={item}
                          title={selectedProject.title}
                          index={index}
                          priority={index === 0}
                          onZoomImage={openDetailLightbox}
                        />
                      ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {detailLightbox ? (
        <DetailImageLightbox
          src={detailLightbox.src}
          alt={detailLightbox.alt}
          onClose={closeDetailLightbox}
        />
      ) : null}
    </section>
  );
}

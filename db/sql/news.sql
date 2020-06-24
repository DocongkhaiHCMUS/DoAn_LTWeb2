-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 20, 2020 lúc 06:04 PM
-- Phiên bản máy phục vụ: 10.4.11-MariaDB
-- Phiên bản PHP: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `news`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `assign`
--

CREATE TABLE `assign` (
  `id` int(11) NOT NULL,
  `category` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `create_date` datetime DEFAULT NULL,
  `modifile_date` datetime DEFAULT NULL,
  `delete` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(4255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_date` datetime DEFAULT NULL,
  `modifile_date` datetime DEFAULT NULL,
  `delete` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `page`
--

CREATE TABLE `page` (
  `id` int(11) NOT NULL,
  `name` tinytext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `modifile_date` datetime DEFAULT NULL,
  `delete` tinyint(4) DEFAULT 0,
  `title` tinytext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `des` tinytext COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `permision`
--

CREATE TABLE `permision` (
  `id` int(11) NOT NULL,
  `permision` int(11) NOT NULL,
  `name` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_date` datetime DEFAULT NULL,
  `modifile_date` datetime DEFAULT NULL,
  `delete` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `permission_page`
--

CREATE TABLE `permission_page` (
  `id` int(11) NOT NULL,
  `permission` int(11) NOT NULL,
  `page` int(11) NOT NULL,
  `create_date` datetime DEFAULT NULL,
  `modifile_date` int(11) DEFAULT NULL,
  `delete` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `post`
--

CREATE TABLE `post` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tiny_des` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_des` mediumtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author` int(11) NOT NULL,
  `views` int(11) DEFAULT 0,
  `category` int(11) DEFAULT NULL,
  `premium` tinyint(4) NOT NULL DEFAULT 0,
  `pdf` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 0,
  `reason` tinytext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `editor` int(11) DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `modifile_date` datetime DEFAULT NULL,
  `publish_date` datetime DEFAULT NULL,
  `delete` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tag`
--

CREATE TABLE `tag` (
  `id` int(11) NOT NULL,
  `name` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `des` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `modifile_date` datetime DEFAULT NULL,
  `delete` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tag_post`
--

CREATE TABLE `tag_post` (
  `id` int(11) NOT NULL,
  `tag` int(11) DEFAULT NULL,
  `post` int(11) DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `modifile_date` datetime DEFAULT NULL,
  `delete` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `DOB` datetime DEFAULT NULL,
  `gender` tinyint(4) DEFAULT 0,
  `email` tinytext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` tinytext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `premium` tinyint(4) DEFAULT 0,
  `time_out` datetime DEFAULT NULL,
  `permision` int(11) DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `modifile_date` datetime DEFAULT NULL,
  `active` tinyint(4) DEFAULT NULL,
  `delete` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_comment`
--

CREATE TABLE `user_comment` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `post` int(11) NOT NULL,
  `comment` mediumtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time_comment` datetime NOT NULL,
  `create_date` datetime DEFAULT NULL,
  `modifile_date` datetime DEFAULT NULL,
  `delete` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `assign`
--
ALTER TABLE `assign`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `page`
--
ALTER TABLE `page`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `permision`
--
ALTER TABLE `permision`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `permission_page`
--
ALTER TABLE `permission_page`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `tag_post`
--
ALTER TABLE `tag_post`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `user_comment`
--
ALTER TABLE `user_comment`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `assign`
--
ALTER TABLE `assign`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `page`
--
ALTER TABLE `page`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `permission_page`
--
ALTER TABLE `permission_page`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `post`
--
ALTER TABLE `post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `tag`
--
ALTER TABLE `tag`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `tag_post`
--
ALTER TABLE `tag_post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `user_comment`
--
ALTER TABLE `user_comment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

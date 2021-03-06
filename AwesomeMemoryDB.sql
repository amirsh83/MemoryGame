USE [master]
GO
/****** Object:  Database [AwesomeMemoryGame]    Script Date: 29/01/2019 18:59:30 ******/
CREATE DATABASE [AwesomeMemoryGame]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'AwesomeMemoryGame', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL14.SQLEXPRESS\MSSQL\DATA\AwesomeMemoryGame.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'AwesomeMemoryGame_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL14.SQLEXPRESS\MSSQL\DATA\AwesomeMemoryGame_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [AwesomeMemoryGame].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [AwesomeMemoryGame] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET ARITHABORT OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [AwesomeMemoryGame] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [AwesomeMemoryGame] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET  DISABLE_BROKER 
GO
ALTER DATABASE [AwesomeMemoryGame] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [AwesomeMemoryGame] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [AwesomeMemoryGame] SET  MULTI_USER 
GO
ALTER DATABASE [AwesomeMemoryGame] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [AwesomeMemoryGame] SET DB_CHAINING OFF 
GO
ALTER DATABASE [AwesomeMemoryGame] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [AwesomeMemoryGame] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [AwesomeMemoryGame] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [AwesomeMemoryGame] SET QUERY_STORE = OFF
GO
USE [AwesomeMemoryGame]
GO
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 0;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET MAXDOP = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET LEGACY_CARDINALITY_ESTIMATION = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET PARAMETER_SNIFFING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET PARAMETER_SNIFFING = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET QUERY_OPTIMIZER_HOTFIXES = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET QUERY_OPTIMIZER_HOTFIXES = PRIMARY;
GO
USE [AwesomeMemoryGame]
GO
/****** Object:  Table [dbo].[GameResults]    Script Date: 29/01/2019 18:59:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GameResults](
	[GameResultID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NOT NULL,
	[DatePlayed] [datetime] NOT NULL,
	[GameSessionLength] [bigint] NOT NULL,
	[StepsTaken] [int] NOT NULL,
 CONSTRAINT [PK_GameResults] PRIMARY KEY CLUSTERED 
(
	[GameResultID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Images]    Script Date: 29/01/2019 18:59:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Images](
	[ImageID] [int] IDENTITY(1,1) NOT NULL,
	[ImageName] [nvarchar](50) NULL,
 CONSTRAINT [PK_Images] PRIMARY KEY CLUSTERED 
(
	[ImageID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Messages]    Script Date: 29/01/2019 18:59:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Messages](
	[MessageID] [int] IDENTITY(1,1) NOT NULL,
	[DateAdded] [datetime] NOT NULL,
	[Phone] [nvarchar](50) NULL,
	[Email] [nvarchar](50) NULL,
	[Message] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_Messages] PRIMARY KEY CLUSTERED 
(
	[MessageID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Users]    Script Date: 29/01/2019 18:59:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[FullName] [nvarchar](50) NOT NULL,
	[UserName] [nvarchar](50) NOT NULL,
	[Password] [nvarchar](50) NOT NULL,
	[Email] [nvarchar](50) NULL,
	[DateOfBirth] [date] NULL,
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[UsersFeedback]    Script Date: 29/01/2019 18:59:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UsersFeedback](
	[FeedbackID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NOT NULL,
	[FeedbackDate] [datetime] NOT NULL,
	[FeedbackText] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_UsersFeedback] PRIMARY KEY CLUSTERED 
(
	[FeedbackID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET IDENTITY_INSERT [dbo].[GameResults] ON 

INSERT [dbo].[GameResults] ([GameResultID], [UserID], [DatePlayed], [GameSessionLength], [StepsTaken]) VALUES (49, 42, CAST(N'2019-01-28T22:20:55.023' AS DateTime), 663, 24)
INSERT [dbo].[GameResults] ([GameResultID], [UserID], [DatePlayed], [GameSessionLength], [StepsTaken]) VALUES (50, 42, CAST(N'2019-01-28T22:21:12.833' AS DateTime), 5423, 24)
INSERT [dbo].[GameResults] ([GameResultID], [UserID], [DatePlayed], [GameSessionLength], [StepsTaken]) VALUES (51, 43, CAST(N'2019-01-28T22:21:51.387' AS DateTime), 2153, 9)
INSERT [dbo].[GameResults] ([GameResultID], [UserID], [DatePlayed], [GameSessionLength], [StepsTaken]) VALUES (52, 44, CAST(N'2019-01-28T22:22:30.097' AS DateTime), 500, 16)
INSERT [dbo].[GameResults] ([GameResultID], [UserID], [DatePlayed], [GameSessionLength], [StepsTaken]) VALUES (53, 44, CAST(N'2019-01-28T22:24:32.863' AS DateTime), 863, 43)
INSERT [dbo].[GameResults] ([GameResultID], [UserID], [DatePlayed], [GameSessionLength], [StepsTaken]) VALUES (54, 44, CAST(N'2019-01-28T22:24:46.367' AS DateTime), 463, 43)
INSERT [dbo].[GameResults] ([GameResultID], [UserID], [DatePlayed], [GameSessionLength], [StepsTaken]) VALUES (55, 42, CAST(N'2019-01-28T22:25:26.827' AS DateTime), 1232, 77)
INSERT [dbo].[GameResults] ([GameResultID], [UserID], [DatePlayed], [GameSessionLength], [StepsTaken]) VALUES (56, 42, CAST(N'2019-01-28T22:25:34.750' AS DateTime), 122, 77)
INSERT [dbo].[GameResults] ([GameResultID], [UserID], [DatePlayed], [GameSessionLength], [StepsTaken]) VALUES (57, 44, CAST(N'2019-01-28T22:25:43.330' AS DateTime), 122, 77)
INSERT [dbo].[GameResults] ([GameResultID], [UserID], [DatePlayed], [GameSessionLength], [StepsTaken]) VALUES (58, 43, CAST(N'2019-01-28T22:28:14.067' AS DateTime), 243, 14)
SET IDENTITY_INSERT [dbo].[GameResults] OFF
SET IDENTITY_INSERT [dbo].[Images] ON 

INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1004, N'cap.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1005, N'deadpool.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1006, N'hulk.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1007, N'ironman.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1008, N'logan.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1009, N'spiderman.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1010, N'starlord.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1011, N'thor.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1012, N'cap.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1013, N'deadpool.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1014, N'hulk.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1015, N'ironman.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1016, N'logan.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1017, N'spiderman.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1018, N'starlord.jpg')
INSERT [dbo].[Images] ([ImageID], [ImageName]) VALUES (1019, N'thor.jpg')
SET IDENTITY_INSERT [dbo].[Images] OFF
SET IDENTITY_INSERT [dbo].[Messages] ON 

INSERT [dbo].[Messages] ([MessageID], [DateAdded], [Phone], [Email], [Message]) VALUES (17, CAST(N'2019-01-28T21:41:40.833' AS DateTime), N'0544222731', N'Amir.Shahar.83@gmail.com', N'Great Site! keep it up!')
INSERT [dbo].[Messages] ([MessageID], [DateAdded], [Phone], [Email], [Message]) VALUES (18, CAST(N'2019-01-28T21:54:03.717' AS DateTime), N'555-2312', N'seinfeld@ny.com', N'hello newman!')
INSERT [dbo].[Messages] ([MessageID], [DateAdded], [Phone], [Email], [Message]) VALUES (19, CAST(N'2019-01-28T22:38:11.580' AS DateTime), N'555-1323', N'kreamer@vandley.org', N'giddy up! u nailed it!')
SET IDENTITY_INSERT [dbo].[Messages] OFF
SET IDENTITY_INSERT [dbo].[Users] ON 

INSERT [dbo].[Users] ([UserID], [FullName], [UserName], [Password], [Email], [DateOfBirth]) VALUES (42, N'Amir Shahar', N'Amiros', N'Qwerty122', N'Amir.shahar.83@gmail.com', CAST(N'1983-05-11' AS Date))
INSERT [dbo].[Users] ([UserID], [FullName], [UserName], [Password], [Email], [DateOfBirth]) VALUES (43, N'Assaf Finkelstein', N'Assaf', N'Qwerty1', N'Assaf@test.com', CAST(N'1980-01-01' AS Date))
INSERT [dbo].[Users] ([UserID], [FullName], [UserName], [Password], [Email], [DateOfBirth]) VALUES (44, N'Dylan Tomas', N'Dboss', N'Aa123456!', N'dylan@tomas.test', CAST(N'1964-04-17' AS Date))
SET IDENTITY_INSERT [dbo].[Users] OFF
SET IDENTITY_INSERT [dbo].[UsersFeedback] ON 

INSERT [dbo].[UsersFeedback] ([FeedbackID], [UserID], [FeedbackDate], [FeedbackText]) VALUES (22, 42, CAST(N'2019-01-28T21:44:04.160' AS DateTime), N'very cool site. awesome game!')
INSERT [dbo].[UsersFeedback] ([FeedbackID], [UserID], [FeedbackDate], [FeedbackText]) VALUES (23, 43, CAST(N'2019-01-28T22:14:58.913' AS DateTime), N'wow! awesome site!')
INSERT [dbo].[UsersFeedback] ([FeedbackID], [UserID], [FeedbackDate], [FeedbackText]) VALUES (24, 44, CAST(N'2019-01-28T22:16:20.320' AS DateTime), N'very excited about your new site!')
INSERT [dbo].[UsersFeedback] ([FeedbackID], [UserID], [FeedbackDate], [FeedbackText]) VALUES (25, 44, CAST(N'2019-01-28T22:40:15.293' AS DateTime), N'this me leaving a feedback :)')
SET IDENTITY_INSERT [dbo].[UsersFeedback] OFF
ALTER TABLE [dbo].[Messages] ADD  CONSTRAINT [DF_Messages_DateAdded]  DEFAULT (getdate()) FOR [DateAdded]
GO
ALTER TABLE [dbo].[GameResults]  WITH CHECK ADD FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[UsersFeedback]  WITH CHECK ADD FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
USE [master]
GO
ALTER DATABASE [AwesomeMemoryGame] SET  READ_WRITE 
GO

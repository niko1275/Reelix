import {inferRouterOutputs} from "@trpc/server"

import { AppRouter } from "@/server/routers/_app"

export type videoGetOneOutput = inferRouterOutputs<AppRouter>["video"]["getById"]

export type videoGetByOne = inferRouterOutputs<AppRouter>["video"]["getone"]

export type videoGetVideoSuggestionsOutput = inferRouterOutputs<AppRouter>["video"]["getVideoSuggestions"]["items"]

export type playlistGetUserPlaylistsAndVideosPlaylistsOutput = inferRouterOutputs<AppRouter>["playlist"]["getUserPlaylistsWithFirstVideo"]


export type userGetOneUserOutput = inferRouterOutputs<AppRouter>["user"]["getOneUser"]["videosUser"]

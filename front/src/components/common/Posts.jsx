import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType , username , userId}) => {
    const getPostEndPoint = () => {
        switch (feedType) {
            case "posts":
                return `/api/posts/user/${username}`;
            case "likes":
                return `/api/posts/liked/${userId}`;
            case "forYou":
                return "/api/posts/all";
            case "following":
                return "/api/posts/following";
            default:
                return "/api/posts/all";
        }
    };

    const POST_ENDPOINT = getPostEndPoint();
    
    console.log(POST_ENDPOINT);
    
    const { data: posts, isLoading , refetch} = useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            try {
                const res = await fetch(`${POST_ENDPOINT}`);
                const data = await res.json();
                
                return data;

            } catch (error) {
                console.log(error);
               
            }
        },
    
    });



	useEffect(() => {
		refetch();
	}, [feedType, refetch]);


    if (isLoading && refetch) {
        return (
            <div className='flex flex-col justify-center'>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
            </div>
        );
    }

    if (!isLoading && (!posts || !Array.isArray(posts))) {
        return <p className='text-center my-4'>No posts in this tab. Switch 👻</p>;
    }

    return (
        <div>
            {posts.map((post) => (
                <Post key={post._id} post={post} />
            ))}
        </div>
    );
};

export default Posts;

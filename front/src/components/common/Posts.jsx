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
    console.log(posts);


	useEffect(() => {
		refetch();
	}, [username, feedType, refetch]);


    if (isLoading && refetch) {
        return (
            <div className='flex flex-col justify-center'>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
            </div>
        );
    }

    if (!isLoading && posts?.length===0) {
        return <p className='text-center my-4'>💔 No posts </p>;
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

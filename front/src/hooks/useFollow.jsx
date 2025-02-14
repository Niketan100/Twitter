import { useMutation, useQuery , useQueryClient } from "@tanstack/react-query";
import {toast} from 'react-hot-toast'


const userfollow = () =>{
    const  queryClient = useQueryClient();

    const{mutate: follow , isPending} = useMutation({
        mutationFn: async (userId) =>{
            try {
                const res = await fetch(`/api/users/follow/${userId}`, {
                    method: 'POST',
                })

                const data = await res.json();
                if(!res.ok) throw new Error(error.message || "Something wrong");
                console.log(data, "from Follow Hook");
                return data;
            } catch (error) {
                console.log(error)
            }
        },
        onSuccess: () =>{
            toast.success("Done")
            Promise.all([
            queryClient.invalidateQueries({queryKey: ["suggestedUsers"]}),
            queryClient.invalidateQueries({queryKey: ["userProfile"]}),
            queryClient.invalidateQueries({queryKey: ["authUser"]})  

        
        ]);
        }
    });
    return {follow , isPending};
}
export default userfollow;
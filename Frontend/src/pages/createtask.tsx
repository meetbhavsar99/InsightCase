import * as React from "react";
import Link from 'next/link'
export default function Createtask() {
  return (
    <div>
        <form className="flex overflow-hidden flex-col pt-6 pb-12 text-sm font-medium text-white rounded-2xl bg-zinc-700 max-w-[867px] mx-auto">
        {/* <div className="flex shrink-0 self-end mr-9 w-11 h-11 rounded-full bg-zinc-600 max-md:mr-2.5" /> */}
        <Link href="/dashboard">
        <button className="flex shrink-0 self-end mr-9 w-11 h-11 rounded-full bg-zinc-600 max-md:mr-2.5" />
        </Link>
        <div className="flex flex-col items-start px-9 w-full max-md:px-5 max-md:max-w-full">
            
            <div>Case Number</div>
            <input
            type="text"
            className="px-2 py-3 mt-2.5 max-w-full whitespace-nowrap rounded-lg bg-zinc-600 w-[219px] max-md:pr-5"
            defaultValue="C097Q"
            />

            <div className="mt-9">Description</div>
            <textarea
            className="self-stretch px-2 pt-2.5 pb-24 mt-2.5 text-xs rounded-lg bg-zinc-600 text-zinc-300 max-md:pr-5 max-md:max-w-full"
            defaultValue="Write description here"
            />

            <div className="mt-9">Deadline</div>
            <div className="flex gap-5 justify-between px-3 py-3 mt-2.5 max-w-full rounded-lg bg-zinc-600 w-[283px]">
            <input type="date" className="bg-transparent text-white" />
            <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0543ff8b6f51bb3f585f6f6de6b922a236706b7c1aefbcf0f7e40355ffab658?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                className="object-contain shrink-0 my-auto w-3 aspect-[1.72]"
            />
            </div>

            <div className="flex gap-2 mt-9 text-base whitespace-nowrap">
            <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/f4e2708de5f928daffeaed07a3d4d63dd6eb547155afc7127d3d4f6ee9af968d?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                className="object-contain shrink-0 w-6 rounded-sm aspect-square"
            />
            <label>
                <input type="checkbox" className="mr-2" />
                Completed
            </label>
            </div>

            <div className="mt-9">Completed At:</div>
            <div className="flex gap-4 px-3 py-3 mt-2.5 rounded-lg bg-zinc-600">
            <input type="datetime-local" className="bg-transparent text-white flex-auto" />
            <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0543ff8b6f51bb3f585f6f6de6b922a236706b7c1aefbcf0f7e40355ffab658?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                className="object-contain shrink-0 my-auto w-3 aspect-[1.72]"
            />
            </div>

            <button type="submit" className="self-center px-16 py-3.5 mt-20 max-w-full text-base font-bold whitespace-nowrap bg-amber-300 rounded-lg shadow-[0px_4px_10px_rgba(77,72,151,0.3)] w-[315px] max-md:px-5 max-md:mt-10">
            Save
            </button>
        </div>
        </form>
    </div>
    

    // <div className="flex overflow-hidden flex-col pt-6 pb-12 text-sm font-medium text-white rounded-2xl bg-zinc-700 max-w-[867px] mx-auto">
    //   <div className="flex shrink-0 self-end mr-9 w-11 h-11 rounded-full bg-zinc-600 max-md:mr-2.5" />
    //   <div className="flex flex-col items-start px-9 w-full max-md:px-5 max-md:max-w-full">
    //     <div>Case Number</div>
    //     <div className="px-2 py-3 mt-2.5 max-w-full whitespace-nowrap rounded-lg bg-zinc-600 w-[219px] max-md:pr-5">
    //       C097Q
    //     </div>
    //     <div className="mt-9">Description</div>
    //     <div className="self-stretch px-2 pt-2.5 pb-24 mt-2.5 text-xs rounded-lg bg-zinc-600 text-zinc-300 max-md:pr-5 max-md:max-w-full">
    //       Write description here
    //     </div>
    //     <div className="mt-9">Deadline</div>
    //     <div className="flex gap-5 justify-between px-3 py-3 mt-2.5 max-w-full rounded-lg bg-zinc-600 w-[283px]">
    //       <div>Wednesday, 11th October</div>
    //       <img
    //         loading="lazy"
    //         src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0543ff8b6f51bb3f585f6f6de6b922a236706b7c1aefbcf0f7e40355ffab658?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
    //         className="object-contain shrink-0 my-auto w-3 aspect-[1.72]"
    //       />
    //     </div>
    //     <div className="flex gap-2 mt-9 text-base whitespace-nowrap">
    //       <img
    //         loading="lazy"
    //         src="https://cdn.builder.io/api/v1/image/assets/TEMP/f4e2708de5f928daffeaed07a3d4d63dd6eb547155afc7127d3d4f6ee9af968d?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
    //         className="object-contain shrink-0 w-6 rounded-sm aspect-square"
    //       />
    //       <div>Completed</div>
    //     </div>
    //     <div className="mt-9">Completed At:</div>
    //     <div className="flex gap-4 px-3 py-3 mt-2.5 rounded-lg bg-zinc-600">
    //       <div className="flex-auto">Wednesday, 11th October 11:05:34 PM</div>
    //       <img
    //         loading="lazy"
    //         src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0543ff8b6f51bb3f585f6f6de6b922a236706b7c1aefbcf0f7e40355ffab658?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
    //         className="object-contain shrink-0 my-auto w-3 aspect-[1.72]"
    //       />
    //     </div>
    //     <div className="self-center px-16 py-3.5 mt-20 max-w-full text-base font-bold whitespace-nowrap bg-amber-300 rounded-lg shadow-[0px_4px_10px_rgba(77,72,151,0.3)] w-[315px] max-md:px-5 max-md:mt-10">
    //       Save
    //     </div>
    //   </div>
    // </div>
  );
}
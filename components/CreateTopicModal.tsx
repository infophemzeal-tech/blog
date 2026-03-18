"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Swal from "sweetalert2"

export default function CreateTopicModal() {
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])
  const supabase = createClient()

  const swalConfig = {
    background: document.documentElement.classList.contains('dark') ? '#1c1917' : '#fff',
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
  }

  const handleCreate = async () => {
    // 1. Fetch Categories for the dropdown
    const { data: catData } = await supabase.from("topic_categories").select("id, name")
    
    if (!catData) return

    // 2. Open the SweetAlert with a custom HTML form
    const { value: formValues } = await Swal.fire({
      title: 'Create New Topic',
      ...swalConfig,
      html: `
        <div class="flex flex-col gap-4 text-left p-2">
          <div>
            <label class="text-[10px] uppercase font-bold text-stone-400">Category</label>
            <select id="swal-category" class="w-full mt-1 p-2 rounded border border-stone-200 dark:border-stone-800 bg-transparent text-sm">
              ${catData.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="text-[10px] uppercase font-bold text-stone-400">Topic Name</label>
            <input id="swal-name" placeholder="e.g. Artificial Intelligence" class="w-full mt-1 p-2 rounded border border-stone-200 dark:border-stone-800 bg-transparent text-sm">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Create Topic',
      confirmButtonColor: '#16a34a',
      preConfirm: () => {
        return {
          categoryId: (document.getElementById('swal-category') as HTMLSelectElement).value,
          name: (document.getElementById('swal-name') as HTMLInputElement).value
        }
      }
    })

    if (formValues && formValues.name) {
      const slug = formValues.name.toLowerCase().trim().replace(/\s+/g, "-")
      
      const { error } = await supabase.from("topics").insert({
        name: formValues.name,
        slug: slug,
        category_id: formValues.categoryId
      })

      if (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message, ...swalConfig })
      } else {
        Swal.fire({ icon: 'success', title: 'Topic Created!', timer: 1500, showConfirmButton: false, ...swalConfig })
        window.location.reload() // Refresh to see the new topic in Sidebar/Editor
      }
    }
  }

  return (
    <button
      onClick={handleCreate}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
    >
      <span>+</span> New Topic
    </button>
  )
}

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { formSchema, ContactFormValues } from "@/components/contacts/schema/contactFormSchema";
import { ContactWithRelations } from "@/components/contacts/ContactTableRow";

interface Company {
  company_id: number;
  company_name: string;
}

interface User {
  id: string;
  full_name: string | null;
  role?: string;
}

interface UseContactFormProps {
  contactToEdit?: ContactWithRelations;
  onContactSaved: () => void;
  onClose: () => void;
  isOpen: boolean; // New prop to track when modal is open
}

export const useContactForm = ({ contactToEdit, onContactSaved, onClose, isOpen }: UseContactFormProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const { user } = useAuth();
  
  // Ref to track if form has been initialized with edit data
  const initializedRef = useRef(false);

  // Reset the initialization flag when the modal is closed or opened
  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      initializedRef.current = false;
    }
  }, [isOpen]);

  // Initialize form with default values
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      nie: "",
      primary_phone: "",
      secondary_phone: "",
      primary_email: "",
      secondary_email: "",
      delivery_address_street: "",
      delivery_address_number: "",
      delivery_address_apartment: "",
      delivery_address_city: "",
      delivery_address_postal_code: "",
      delivery_address_country: "Spain",
      associated_company_id: null,
      owner_user_id: null,
      notes: "",
    },
  });

  // Fetch companies and users when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from("companies")
          .select("company_id, company_name")
          .order("company_name");

        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);

        // Fetch users (with roles that can manage contacts)
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("role", ["Главный Администратор", "Администратор", "Менеджер"])
          .order("full_name");

        if (usersError) throw usersError;
        setUsers(usersData || []);
      } catch (err) {
        console.error("Error fetching form data:", err);
        toast.error("Ошибка при загрузке данных формы");
      }
    };

    fetchData();
  }, []);

  // Set form values when editing a contact or resetting
  useEffect(() => {
    console.log("Form initialization effect running", { 
      isInitialized: initializedRef.current, 
      isOpen, 
      isEditing: !!contactToEdit 
    });

    // Only initialize if form is open and not already initialized
    if (isOpen && !initializedRef.current) {
      if (contactToEdit) {
        // Editing existing contact
        console.log("Initializing form with contact data:", contactToEdit);
        form.reset({
          full_name: contactToEdit.full_name || "",
          nie: contactToEdit.nie || "",
          primary_phone: contactToEdit.primary_phone || "",
          secondary_phone: contactToEdit.secondary_phone || "",
          primary_email: contactToEdit.primary_email || "",
          secondary_email: contactToEdit.secondary_email || "",
          delivery_address_street: contactToEdit.delivery_address_street || "",
          delivery_address_number: contactToEdit.delivery_address_number || "",
          delivery_address_apartment: contactToEdit.delivery_address_apartment || "",
          delivery_address_city: contactToEdit.delivery_address_city || "",
          delivery_address_postal_code: contactToEdit.delivery_address_postal_code || "",
          delivery_address_country: contactToEdit.delivery_address_country || "Spain",
          associated_company_id: contactToEdit.associated_company_id,
          owner_user_id: contactToEdit.owner_user_id || null,
          notes: contactToEdit.notes || "",
        });
        
        // Load attached files if they exist
        if (contactToEdit.attached_files_general) {
          setAttachedFiles(contactToEdit.attached_files_general);
        } else {
          setAttachedFiles([]);
        }
      } else {
        // Reset form when adding a new contact
        console.log("Initializing empty form for new contact");
        form.reset({
          full_name: "",
          nie: "",
          primary_phone: "",
          secondary_phone: "",
          primary_email: "",
          secondary_email: "",
          delivery_address_street: "",
          delivery_address_number: "",
          delivery_address_apartment: "",
          delivery_address_city: "",
          delivery_address_postal_code: "",
          delivery_address_country: "Spain",
          associated_company_id: null,
          owner_user_id: user?.id || null,
          notes: "",
        });
        setAttachedFiles([]);
      }
      
      // Mark as initialized
      initializedRef.current = true;
      console.log("Form initialization complete");
    }
  }, [contactToEdit, form, user, isOpen]);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      setLoading(true);
      
      console.log("Submitting contact form with values:", values);
      
      // Ensure full_name is present since it's required
      if (!values.full_name) {
        toast.error("ФИО обязательно для заполнения");
        return;
      }
      
      // Create a typed object that matches the expected Supabase database structure
      const contactData = {
        full_name: values.full_name,
        nie: values.nie,
        primary_phone: values.primary_phone,
        secondary_phone: values.secondary_phone,
        primary_email: values.primary_email,
        secondary_email: values.secondary_email,
        delivery_address_street: values.delivery_address_street,
        delivery_address_number: values.delivery_address_number,
        delivery_address_apartment: values.delivery_address_apartment,
        delivery_address_city: values.delivery_address_city,
        delivery_address_postal_code: values.delivery_address_postal_code,
        delivery_address_country: values.delivery_address_country,
        associated_company_id: values.associated_company_id,
        owner_user_id: values.owner_user_id,
        notes: values.notes,
        attached_files_general: attachedFiles.length > 0 ? attachedFiles : null
      };
      
      let result;
      
      if (contactToEdit) {
        // Update existing contact
        console.log("Updating contact with ID:", contactToEdit.contact_id);
        result = await supabase
          .from("contacts")
          .update(contactData)
          .eq("contact_id", contactToEdit.contact_id);
      } else {
        // Insert new contact
        console.log("Creating new contact");
        result = await supabase
          .from("contacts")
          .insert(contactData);
      }
      
      const { error, data } = result;
      
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Contact saved successfully:", data);
      
      toast.success(
        contactToEdit
          ? "Контакт успешно обновлен"
          : "Контакт успешно создан"
      );
      
      // Reset initializedRef when closing the form so it can be initialized again next time
      initializedRef.current = false;
      
      onContactSaved();
      onClose();
    } catch (err) {
      console.error("Error saving contact:", err);
      
      let errorMessage = "Неизвестная ошибка";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      toast.error(
        contactToEdit
          ? `Ошибка при обновлении контакта: ${errorMessage}`
          : `Ошибка при создании контакта: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Сброс состояния формы при закрытии модального окна
  const handleClose = () => {
    // Reset initializedRef when closing the form
    initializedRef.current = false;
    onClose();
  };

  return {
    form,
    companies,
    users,
    loading,
    onSubmit,
    attachedFiles,
    setAttachedFiles,
    handleClose
  };
};

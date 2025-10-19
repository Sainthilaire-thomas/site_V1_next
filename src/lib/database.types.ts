export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          first_name: string | null
          id: string
          is_default: boolean | null
          last_name: string | null
          postal_code: string | null
          type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_default?: boolean | null
          last_name?: string | null
          postal_code?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_default?: boolean | null
          last_name?: string | null
          postal_code?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          browser: string | null
          cart_value: number | null
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          device_type: string | null
          event_type: string
          id: string
          language: string | null
          order_id: string | null
          os: string | null
          page_load_time: number | null
          page_path: string | null
          page_title: string | null
          product_id: string | null
          properties: Json | null
          referrer: string | null
          revenue: number | null
          screen_resolution: string | null
          session_id: string
          time_on_page: number | null
          timezone: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          cart_value?: number | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type: string
          id?: string
          language?: string | null
          order_id?: string | null
          os?: string | null
          page_load_time?: number | null
          page_path?: string | null
          page_title?: string | null
          product_id?: string | null
          properties?: Json | null
          referrer?: string | null
          revenue?: number | null
          screen_resolution?: string | null
          session_id: string
          time_on_page?: number | null
          timezone?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          cart_value?: number | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          language?: string | null
          order_id?: string | null
          os?: string | null
          page_load_time?: number | null
          page_path?: string | null
          page_title?: string | null
          product_id?: string | null
          properties?: Json | null
          referrer?: string | null
          revenue?: number | null
          screen_resolution?: string | null
          session_id?: string
          time_on_page?: number | null
          timezone?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_products: {
        Row: {
          collection_id: string
          created_at: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          collection_id: string
          created_at?: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          collection_id?: string
          created_at?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          type: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          type?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          type?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
      customer_notes: {
        Row: {
          admin_id: string
          created_at: string
          customer_id: string
          id: string
          note: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          customer_id: string
          id?: string
          note: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          note?: string
          updated_at?: string
        }
        Relationships: []
      }
      launch_notifications: {
        Row: {
          cart_items: Json | null
          cart_total: number | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          notified_at: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cart_items?: Json | null
          cart_total?: number | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          notified_at?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cart_items?: Json | null
          cart_total?: number | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notified_at?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          bounced: number | null
          click_rate: number | null
          clicked: number | null
          complained: number | null
          content: Json
          created_at: string | null
          created_by: string | null
          delivered: number | null
          id: string
          name: string
          open_rate: number | null
          opened: number | null
          preview_text: string | null
          scheduled_for: string | null
          sent: number | null
          sent_at: string | null
          status: string
          subject: string
          unsubscribed: number | null
          updated_at: string | null
          utm_campaign: string
        }
        Insert: {
          bounced?: number | null
          click_rate?: number | null
          clicked?: number | null
          complained?: number | null
          content: Json
          created_at?: string | null
          created_by?: string | null
          delivered?: number | null
          id?: string
          name: string
          open_rate?: number | null
          opened?: number | null
          preview_text?: string | null
          scheduled_for?: string | null
          sent?: number | null
          sent_at?: string | null
          status?: string
          subject: string
          unsubscribed?: number | null
          updated_at?: string | null
          utm_campaign: string
        }
        Update: {
          bounced?: number | null
          click_rate?: number | null
          clicked?: number | null
          complained?: number | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          delivered?: number | null
          id?: string
          name?: string
          open_rate?: number | null
          opened?: number | null
          preview_text?: string | null
          scheduled_for?: string | null
          sent?: number | null
          sent_at?: string | null
          status?: string
          subject?: string
          unsubscribed?: number | null
          updated_at?: string | null
          utm_campaign?: string
        }
        Relationships: []
      }
      newsletter_clicks: {
        Row: {
          clicked_at: string | null
          id: string
          link_url: string
          send_id: string
          utm_content: string | null
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          link_url: string
          send_id: string
          utm_content?: string | null
        }
        Update: {
          clicked_at?: string | null
          id?: string
          link_url?: string
          send_id?: string
          utm_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_clicks_send_id_fkey"
            columns: ["send_id"]
            isOneToOne: false
            referencedRelation: "newsletter_sends"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_sends: {
        Row: {
          bounce_reason: string | null
          campaign_id: string
          clicks_count: number | null
          complaint_reason: string | null
          created_at: string | null
          delivered_at: string | null
          first_clicked_at: string | null
          first_opened_at: string | null
          id: string
          last_clicked_at: string | null
          last_opened_at: string | null
          opens_count: number | null
          resend_email_id: string | null
          sent_at: string | null
          status: string
          subscriber_id: string
        }
        Insert: {
          bounce_reason?: string | null
          campaign_id: string
          clicks_count?: number | null
          complaint_reason?: string | null
          created_at?: string | null
          delivered_at?: string | null
          first_clicked_at?: string | null
          first_opened_at?: string | null
          id?: string
          last_clicked_at?: string | null
          last_opened_at?: string | null
          opens_count?: number | null
          resend_email_id?: string | null
          sent_at?: string | null
          status?: string
          subscriber_id: string
        }
        Update: {
          bounce_reason?: string | null
          campaign_id?: string
          clicks_count?: number | null
          complaint_reason?: string | null
          created_at?: string | null
          delivered_at?: string | null
          first_clicked_at?: string | null
          first_opened_at?: string | null
          id?: string
          last_clicked_at?: string | null
          last_opened_at?: string | null
          opens_count?: number | null
          resend_email_id?: string | null
          sent_at?: string | null
          status?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_sends_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          consent_given_at: string
          consent_ip: string | null
          consent_source: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_clicked_at: string | null
          last_name: string | null
          last_opened_at: string | null
          status: string
          total_clicks: number | null
          total_opens: number | null
          unsubscribe_reason: string | null
          unsubscribed_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          consent_given_at?: string
          consent_ip?: string | null
          consent_source?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_clicked_at?: string | null
          last_name?: string | null
          last_opened_at?: string | null
          status?: string
          total_clicks?: number | null
          total_opens?: number | null
          unsubscribe_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          consent_given_at?: string
          consent_ip?: string | null
          consent_source?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_clicked_at?: string | null
          last_name?: string | null
          last_opened_at?: string | null
          status?: string
          total_clicks?: number | null
          total_opens?: number | null
          unsubscribe_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          order_id: string | null
          product_id: string | null
          product_name: string | null
          product_sku: string | null
          product_snapshot: Json | null
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string | null
          variant_name: string | null
          variant_value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id?: string | null
          product_id?: string | null
          product_name?: string | null
          product_sku?: string | null
          product_snapshot?: Json | null
          quantity: number
          total_price: number
          unit_price: number
          variant_id?: string | null
          variant_name?: string | null
          variant_value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id?: string | null
          product_id?: string | null
          product_name?: string | null
          product_sku?: string | null
          product_snapshot?: Json | null
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
          variant_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          comment: string | null
          created_at: string | null
          from_status: string | null
          id: string
          order_id: string
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          comment?: string | null
          created_at?: string | null
          from_status?: string | null
          id?: string
          order_id: string
          to_status: string
        }
        Update: {
          changed_by?: string | null
          comment?: string | null
          created_at?: string | null
          from_status?: string | null
          id?: string
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          billing_address: Json | null
          cancelled_at: string | null
          carrier: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          discount_amount: number | null
          estimated_delivery: string | null
          fulfillment_status: string | null
          id: string
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_intent_id: string | null
          payment_status: string | null
          promo_code: string | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_amount: number | null
          shipping_method: string | null
          status: string | null
          stripe_session_id: string | null
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          billing_address?: Json | null
          cancelled_at?: string | null
          carrier?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          fulfillment_status?: string | null
          id?: string
          notes?: string | null
          order_number: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          promo_code?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          shipping_method?: string | null
          status?: string | null
          stripe_session_id?: string | null
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          billing_address?: Json | null
          cancelled_at?: string | null
          carrier?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          fulfillment_status?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          promo_code?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          shipping_method?: string | null
          status?: string | null
          stripe_session_id?: string | null
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders_audit: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_billing_address: Json | null
          new_shipping_address: Json | null
          old_billing_address: Json | null
          old_shipping_address: Json | null
          operation: string | null
          order_id: string
          order_number: string | null
          trigger_name: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_billing_address?: Json | null
          new_shipping_address?: Json | null
          old_billing_address?: Json | null
          old_shipping_address?: Json | null
          operation?: string | null
          order_id: string
          order_number?: string | null
          trigger_name?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_billing_address?: Json | null
          new_shipping_address?: Json | null
          old_billing_address?: Json | null
          old_shipping_address?: Json | null
          operation?: string | null
          order_id?: string
          order_number?: string | null
          trigger_name?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string | null
          height: number | null
          id: string
          is_primary: boolean | null
          product_id: string
          sort_order: number | null
          storage_master: string | null
          storage_original: string
          updated_at: string | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          created_at?: string | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          product_id: string
          sort_order?: number | null
          storage_master?: string | null
          storage_original: string
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          created_at?: string | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          product_id?: string
          sort_order?: number | null
          storage_master?: string | null
          storage_original?: string
          updated_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images_backup: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string | null
          is_primary: boolean | null
          product_id: string | null
          sort_order: number | null
          url: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string | null
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          url?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string | null
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          url?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          price_modifier: number | null
          product_id: string | null
          sku: string | null
          stock_quantity: number | null
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          price_modifier?: number | null
          product_id?: string | null
          sku?: string | null
          stock_quantity?: number | null
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price_modifier?: number | null
          product_id?: string | null
          sku?: string | null
          stock_quantity?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care: string | null
          category_id: string | null
          composition: string | null
          craftsmanship: string | null
          created_at: string
          description: string | null
          id: string
          impact: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          sale_price: number | null
          short_description: string | null
          sku: string | null
          slug: string
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          care?: string | null
          category_id?: string | null
          composition?: string | null
          craftsmanship?: string | null
          created_at?: string
          description?: string | null
          id?: string
          impact?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          sale_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug: string
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          care?: string | null
          category_id?: string | null
          composition?: string | null
          craftsmanship?: string | null
          created_at?: string
          description?: string | null
          id?: string
          impact?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          sale_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      returns: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          created_at: string | null
          id: string
          items: Json
          order_id: string
          reason: string
          reason_detail: string | null
          refund_amount: number | null
          refunded_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          created_at?: string | null
          id?: string
          items: Json
          order_id: string
          reason: string
          reason_detail?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          created_at?: string | null
          id?: string
          items?: Json
          order_id?: string
          reason?: string
          reason_detail?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_rates: {
        Row: {
          base_rate: number
          countries: string[] | null
          created_at: string | null
          description: string | null
          estimated_days_max: number | null
          estimated_days_min: number | null
          free_shipping_threshold: number | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          base_rate: number
          countries?: string[] | null
          created_at?: string | null
          description?: string | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          base_rate?: number
          countries?: string[] | null
          created_at?: string | null
          description?: string | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          account_handle: string | null
          account_type: string
          caption: string | null
          comments: number | null
          created_at: string | null
          engagement_rate: number | null
          featured_product_ids: string[] | null
          id: string
          image_url: string | null
          impressions: number | null
          likes: number | null
          post_type: string
          post_url: string | null
          published_at: string
          reach: number | null
          saves: number | null
          shares: number | null
          tracking_link: string | null
          updated_at: string | null
          utm_campaign: string
        }
        Insert: {
          account_handle?: string | null
          account_type: string
          caption?: string | null
          comments?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          featured_product_ids?: string[] | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          likes?: number | null
          post_type: string
          post_url?: string | null
          published_at: string
          reach?: number | null
          saves?: number | null
          shares?: number | null
          tracking_link?: string | null
          updated_at?: string | null
          utm_campaign: string
        }
        Update: {
          account_handle?: string | null
          account_type?: string
          caption?: string | null
          comments?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          featured_product_ids?: string[] | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          likes?: number | null
          post_type?: string
          post_url?: string | null
          published_at?: string
          reach?: number | null
          saves?: number | null
          shares?: number | null
          tracking_link?: string | null
          updated_at?: string | null
          utm_campaign?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          delta: number
          id: string
          reason: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delta: number
          id?: string
          reason: string
          variant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delta?: number
          id?: string
          reason?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      monthly_order_stats: {
        Row: {
          avg_order_value: number | null
          month: string | null
          order_count: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      newsletter_performance: {
        Row: {
          click_rate: number | null
          clicked: number | null
          delivered: number | null
          id: string | null
          name: string | null
          open_rate: number | null
          opened: number | null
          sent: number | null
          sent_at: string | null
          status: string | null
          subject: string | null
          unsubscribed: number | null
          utm_campaign: string | null
          web_add_to_cart: number | null
          web_avg_order_value: number | null
          web_conversion_rate: number | null
          web_pageviews: number | null
          web_product_views: number | null
          web_purchases: number | null
          web_revenue: number | null
          web_sessions: number | null
        }
        Relationships: []
      }
      orders_with_details: {
        Row: {
          admin_notes: string | null
          billing_address: Json | null
          cancelled_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          discount_amount: number | null
          fulfillment_status: string | null
          id: string | null
          items_count: number | null
          notes: string | null
          order_number: string | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_status: string | null
          promo_code: string | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_amount: number | null
          shipping_method: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
          user_email: string | null
          user_full_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
      social_posts_performance: {
        Row: {
          account_handle: string | null
          account_type: string | null
          caption: string | null
          comments: number | null
          cpm_revenue: number | null
          engagement_rate: number | null
          id: string | null
          impressions: number | null
          likes: number | null
          post_type: string | null
          post_url: string | null
          published_at: string | null
          reach: number | null
          saves: number | null
          shares: number | null
          utm_campaign: string | null
          web_add_to_cart: number | null
          web_avg_order_value: number | null
          web_conversion_rate: number | null
          web_purchases: number | null
          web_revenue: number | null
          web_visits: number | null
        }
        Relationships: []
      }
      social_stats_by_period: {
        Row: {
          account_type: string | null
          date: string | null
          posts_count: number | null
          total_engagements: number | null
          total_impressions: number | null
          total_purchases: number | null
          total_revenue: number | null
          total_visits: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_daily_stats: {
        Args: { since_date: string }
        Returns: {
          date: string
          pageviews: number
          visitors: number
        }[]
      }
      get_top_pages: {
        Args: { since_date: string }
        Returns: {
          path: string
          title: string
          views: number
        }[]
      }
      increment_campaign_counter: {
        Args: { p_campaign_id: string; p_counter: string }
        Returns: undefined
      }
      increment_subscriber_counter: {
        Args: { p_counter: string; p_subscriber_id: string }
        Returns: undefined
      }
      insert_order_with_addresses: {
        Args: {
          p_billing_address: Json
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_discount_amount: number
          p_order_number: string
          p_shipping_address: Json
          p_shipping_amount: number
          p_shipping_method: string
          p_stripe_session_id: string
          p_tax_amount: number
          p_total_amount: number
        }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      recompute_product_stock: {
        Args: { p_product_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dashboard_widgets: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          position: number | null
          size: string | null
          title: string | null
          type: Database["public"]["Enums"]["widget_type"]
          view_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          position?: number | null
          size?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["widget_type"]
          view_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          position?: number | null
          size?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["widget_type"]
          view_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_view_id_fkey"
            columns: ["view_id"]
            isOneToOne: false
            referencedRelation: "user_views"
            referencedColumns: ["id"]
          },
        ]
      }
      dim_periodo: {
        Row: {
          ano: number
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          label: string | null
          mes: number
          trimestre: number | null
        }
        Insert: {
          ano: number
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          label?: string | null
          mes: number
          trimestre?: number | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          label?: string | null
          mes?: number
          trimestre?: number | null
        }
        Relationships: []
      }
      dim_regiao: {
        Row: {
          codigo_ibge: string | null
          created_at: string | null
          estado: string | null
          id: string
          nome: string
        }
        Insert: {
          codigo_ibge?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          nome: string
        }
        Update: {
          codigo_ibge?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      fact_financeiro: {
        Row: {
          created_at: string | null
          extras: Json | null
          fonte: string | null
          id: string
          import_log_id: string | null
          imported_by: string | null
          meta: number | null
          moeda: string | null
          periodo_id: string | null
          regiao_id: string | null
          sector_id: string | null
          subtipo: string | null
          tipo: string
          valor: number
        }
        Insert: {
          created_at?: string | null
          extras?: Json | null
          fonte?: string | null
          id?: string
          import_log_id?: string | null
          imported_by?: string | null
          meta?: number | null
          moeda?: string | null
          periodo_id?: string | null
          regiao_id?: string | null
          sector_id?: string | null
          subtipo?: string | null
          tipo: string
          valor: number
        }
        Update: {
          created_at?: string | null
          extras?: Json | null
          fonte?: string | null
          id?: string
          import_log_id?: string | null
          imported_by?: string | null
          meta?: number | null
          moeda?: string | null
          periodo_id?: string | null
          regiao_id?: string | null
          sector_id?: string | null
          subtipo?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fact_financeiro_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "import_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_financeiro_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "dim_periodo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_financeiro_regiao_id_fkey"
            columns: ["regiao_id"]
            isOneToOne: false
            referencedRelation: "dim_regiao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_financeiro_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_marketing: {
        Row: {
          cac: number | null
          canal: string | null
          conversoes: number | null
          created_at: string | null
          extras: Json | null
          fonte: string | null
          id: string
          import_log_id: string | null
          imported_by: string | null
          investimento: number | null
          leads: number | null
          nome_campanha: string | null
          periodo_id: string | null
          roi: number | null
          tipo: string
        }
        Insert: {
          cac?: number | null
          canal?: string | null
          conversoes?: number | null
          created_at?: string | null
          extras?: Json | null
          fonte?: string | null
          id?: string
          import_log_id?: string | null
          imported_by?: string | null
          investimento?: number | null
          leads?: number | null
          nome_campanha?: string | null
          periodo_id?: string | null
          roi?: number | null
          tipo: string
        }
        Update: {
          cac?: number | null
          canal?: string | null
          conversoes?: number | null
          created_at?: string | null
          extras?: Json | null
          fonte?: string | null
          id?: string
          import_log_id?: string | null
          imported_by?: string | null
          investimento?: number | null
          leads?: number | null
          nome_campanha?: string | null
          periodo_id?: string | null
          roi?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_marketing_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "import_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_marketing_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "dim_periodo"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_operacional: {
        Row: {
          classificacao: string | null
          created_at: string | null
          extras: Json | null
          fonte: string | null
          id: string
          import_log_id: string | null
          imported_by: string | null
          item: string | null
          periodo_id: string | null
          quantidade: number | null
          sector_id: string | null
          tipo: string
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          classificacao?: string | null
          created_at?: string | null
          extras?: Json | null
          fonte?: string | null
          id?: string
          import_log_id?: string | null
          imported_by?: string | null
          item?: string | null
          periodo_id?: string | null
          quantidade?: number | null
          sector_id?: string | null
          tipo: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          classificacao?: string | null
          created_at?: string | null
          extras?: Json | null
          fonte?: string | null
          id?: string
          import_log_id?: string | null
          imported_by?: string | null
          item?: string | null
          periodo_id?: string | null
          quantidade?: number | null
          sector_id?: string | null
          tipo?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_operacional_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "import_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_operacional_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "dim_periodo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_operacional_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      import_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_rows: number
          errors: Json | null
          id: string
          import_type: string
          imported_by: string | null
          mappings: Json | null
          processed_rows: number
          skipped_rows: number
          source_file: string
          started_at: string
          status: string
          target_table: string
          total_rows: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_rows?: number
          errors?: Json | null
          id?: string
          import_type?: string
          imported_by?: string | null
          mappings?: Json | null
          processed_rows?: number
          skipped_rows?: number
          source_file: string
          started_at?: string
          status?: string
          target_table: string
          total_rows?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_rows?: number
          errors?: Json | null
          id?: string
          import_type?: string
          imported_by?: string | null
          mappings?: Json | null
          processed_rows?: number
          skipped_rows?: number
          source_file?: string
          started_at?: string
          status?: string
          target_table?: string
          total_rows?: number
        }
        Relationships: []
      }
      imported_metrics: {
        Row: {
          created_at: string
          data: Json
          id: string
          imported_at: string
          imported_by: string | null
          source_file: string
          target_table: string
          total_rows: number
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          imported_at?: string
          imported_by?: string | null
          source_file: string
          target_table: string
          total_rows?: number
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          imported_at?: string
          imported_by?: string | null
          source_file?: string
          target_table?: string
          total_rows?: number
        }
        Relationships: []
      }
      key_results: {
        Row: {
          baseline_value: number
          created_at: string | null
          current_value: number | null
          description: string | null
          due_date: string | null
          id: string
          objective_id: string
          owner_id: string | null
          status: string | null
          target_value: number | null
          title: string
          type: string | null
          unit: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          baseline_value?: number
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          objective_id: string
          owner_id?: string | null
          status?: string | null
          target_value?: number | null
          title: string
          type?: string | null
          unit?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          baseline_value?: number
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          objective_id?: string
          owner_id?: string | null
          status?: string | null
          target_value?: number | null
          title?: string
          type?: string | null
          unit?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          created_at: string | null
          cycle_id: string
          description: string | null
          due_date: string | null
          id: string
          is_archived: boolean | null
          owner_id: string | null
          parent_id: string | null
          priority: string | null
          progress: number | null
          sector_id: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_archived?: boolean | null
          owner_id?: string | null
          parent_id?: string | null
          priority?: string | null
          progress?: number | null
          sector_id?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_archived?: boolean | null
          owner_id?: string | null
          parent_id?: string | null
          priority?: string | null
          progress?: number | null
          sector_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objectives_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "okr_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_cycles: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sectors: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          key_result_id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          key_result_id: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          key_result_id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_key_result_id_fkey"
            columns: ["key_result_id"]
            isOneToOne: false
            referencedRelation: "key_results"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_views: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          layout: Json | null
          name: string
          shared_with: string[] | null
          type: Database["public"]["Enums"]["view_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout?: Json | null
          name: string
          shared_with?: string[] | null
          type: Database["public"]["Enums"]["view_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout?: Json | null
          name?: string
          shared_with?: string[] | null
          type?: Database["public"]["Enums"]["view_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_financeiro_resumo: {
        Row: {
          ano: number | null
          atingimento_pct: number | null
          mes: number | null
          periodo_label: string | null
          regiao: string | null
          registros: number | null
          setor: string | null
          subtipo: string | null
          tipo: string | null
          total_meta: number | null
          total_valor: number | null
          trimestre: number | null
        }
        Relationships: []
      }
      vw_marketing_resumo: {
        Row: {
          ano: number | null
          avg_roi: number | null
          cac_calculado: number | null
          canal: string | null
          cpl: number | null
          mes: number | null
          periodo_label: string | null
          registros: number | null
          tipo: string | null
          total_conversoes: number | null
          total_investimento: number | null
          total_leads: number | null
          trimestre: number | null
        }
        Relationships: []
      }
      vw_operacional_resumo: {
        Row: {
          ano: number | null
          avg_valor_unitario: number | null
          classificacao: string | null
          mes: number | null
          periodo_label: string | null
          registros: number | null
          setor: string | null
          tipo: string | null
          total_quantidade: number | null
          total_valor: number | null
          trimestre: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_view: {
        Args: { _user_id: string; _view_id: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      rollback_import: { Args: { p_import_log_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "gestor" | "analista" | "visualizador"
      view_type: "okr" | "dashboard"
      widget_type:
        | "metric_card"
        | "okr_list"
        | "sector_overview"
        | "progress_chart"
        | "quick_stats"
        | "task_summary"
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
    Enums: {
      app_role: ["admin", "gestor", "analista", "visualizador"],
      view_type: ["okr", "dashboard"],
      widget_type: [
        "metric_card",
        "okr_list",
        "sector_overview",
        "progress_chart",
        "quick_stats",
        "task_summary",
      ],
    },
  },
} as const

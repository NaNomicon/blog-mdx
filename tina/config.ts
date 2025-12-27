import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

const isLocal = process.env.NODE_ENV === "development" || process.env.TINA_PUBLIC_IS_LOCAL === "1";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  // Self-hosted configuration
  // Fallback to a relative path or dummy URL during build to satisfy the CLI
  contentApiUrlOverride: process.env.NEXT_PUBLIC_TINA_GQL_URL || "/api/tina/gql",

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        format: "mdx",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "publishDate",
            label: "Publish Date",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "category",
            label: "Category",
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
          },
          {
            type: "image",
            name: "cover_image",
            label: "Cover Image",
          },
          {
            type: "string",
            name: "tldr",
            label: "TLDR",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
            templates: [
              {
                name: "Callout",
                label: "Callout",
                fields: [
                  {
                    name: "type",
                    label: "Type",
                    type: "string",
                    options: ["info", "warning", "success", "error"],
                  },
                  {
                    name: "title",
                    label: "Title",
                    type: "string",
                  },
                  {
                    name: "children",
                    label: "Content",
                    type: "rich-text",
                  },
                ],
              },
              {
                name: "YouTube",
                label: "YouTube Video",
                fields: [
                  {
                    name: "id",
                    label: "Video ID",
                    type: "string",
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
        ui: {
          // This is an advanced feature used for dynamic lookup of a
          // collection's item based on its path.
          router: ({ document }) => {
            return `/blog/${document._sys.filename}`;
          },
        },
      },
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "mdx",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
        ui: {
          router: ({ document }) => {
            if (document._sys.filename === "privacy-policy") {
              return `/privacy-policy`;
            }
            return undefined;
          },
        },
      },
    ],
  },
});

